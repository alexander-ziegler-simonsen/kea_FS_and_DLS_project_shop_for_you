import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import 'reflect-metadata';
import amqp from 'amqplib';

import { AppDataSource } from './data-source.js';
import { Grocery } from './entities/Grocery.js';
import { GroceryName } from './entities/GroceryName.js';
import { GroceryImage } from './entities/GroceryImage.js';
import { Category } from './entities/Category.js';
import { Price } from './entities/Price.js';
import { Description } from './entities/Description.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({ origin: 'http://127.0.0.1:5500' }));
app.use(express.json());

const auth = new google.auth.GoogleAuth({
  keyFile: 'grocery-uploader-service-account.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});
const drive = google.drive({ version: 'v3', auth });

async function publishToRabbit(grocery: any) {
  const url = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;

  try {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    const exchange = 'grocery-exchange';
    const routingKey = 'grocery.created';

    await channel.assertExchange(exchange, 'topic', { durable: false });

    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(grocery)));
    console.log(`📤 Published grocery to RabbitMQ: ID ${grocery.id}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (err) {
    console.error('🐰 Failed to publish to RabbitMQ:', err);
  }
}

const handler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    const fileMetadata = {
      name: req.file.originalname,
      parents: ['12_zMly4eQvoggqV6ot1WuLrlfgyxQIse'],
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    await drive.permissions.create({
      fileId: file.data.id!,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    const imageUrl = `https://drive.google.com/uc?id=${file.data.id}`;

    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const groceryRepo = AppDataSource.getRepository(Grocery);
    const groceryNameRepo = AppDataSource.getRepository(GroceryName);
    const groceryImageRepo = AppDataSource.getRepository(GroceryImage);
    const categoryRepo = AppDataSource.getRepository(Category);
    const priceRepo = AppDataSource.getRepository(Price);
    const descriptionRepo = AppDataSource.getRepository(Description);

    const grocery = groceryRepo.create();
    await groceryRepo.save(grocery);

    // Create related entities
    const groceryName = groceryNameRepo.create({ name: req.body.name });
    await groceryNameRepo.save(groceryName);

    const groceryImage = groceryImageRepo.create({ image: imageUrl });
    await groceryImageRepo.save(groceryImage);

    let category = await categoryRepo.findOne({ where: { name: req.body.type } });
    if (!category) {
      category = categoryRepo.create({ name: req.body.type });
      await categoryRepo.save(category);
    }

    const price = priceRepo.create({ price: parseFloat(req.body.price) });
    await priceRepo.save(price);

    const description = descriptionRepo.create({ description: req.body.description });
    await descriptionRepo.save(description);

    // Attach relations
    grocery.names = [groceryName];
    grocery.images = [groceryImage];
    grocery.categories = [category];
    grocery.prices = [price];
    grocery.descriptions = [description];
    await groceryRepo.save(grocery);

    fs.unlinkSync(req.file.path);

    // Publish full Grocery
    const fullGrocery = await groceryRepo.findOne({
      where: { id: grocery.id },
      relations: ['names', 'images', 'categories', 'prices', 'descriptions']
    });

    if (fullGrocery) {
      await publishToRabbit(fullGrocery);
    }

    res.json({ success: true, grocery: fullGrocery });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

app.post('/api/groceries', upload.single('image'), handler);

app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));
