// server/create_grocery/server.ts
import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import 'reflect-metadata';
<<<<<<< HEAD
import amqp from 'amqplib';
=======
>>>>>>> 29cbef213ba8363836c217b7de0f333fd266ab27

import { AppDataSource } from './data-source.js';
import { Grocery } from './entities/Grocery.js';
import { Type } from './entities/Type.js';
import { Price } from './entities/Price.js';
import { Description } from './entities/Description.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({ origin: 'http://127.0.0.1:5500' }));

const auth = new google.auth.GoogleAuth({
  keyFile: 'grocery-uploader-service-account.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});
const drive = google.drive({ version: 'v3', auth });

<<<<<<< HEAD
async function publishToRabbit(grocery: any) {
  const url = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;

  try {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    const exchange = 'grocery-exchange';
    const routingKey = 'grocery.created';

    await channel.assertExchange(exchange, 'topic', { durable: false });

    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(grocery)));
    console.log(`📤 Published grocery to RabbitMQ: ${grocery.name}`);

    // Graceful close after slight delay
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (err) {
    console.error('🐰 Failed to publish to RabbitMQ:', err);
  }
}

=======
>>>>>>> 29cbef213ba8363836c217b7de0f333fd266ab27
const handler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    const fileMetadata = {
      name: req.file.originalname,
<<<<<<< HEAD
      parents: ['12_zMly4eQvoggqV6ot1WuLrlfgyxQIse'],
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
=======
      parents: ['12_zMly4eQvoggqV6ot1WuLrlfgyxQIse']
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path)
>>>>>>> 29cbef213ba8363836c217b7de0f333fd266ab27
    };
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
<<<<<<< HEAD
      fields: 'id',
    });

    await drive.permissions.create({
      fileId: file.data.id!,
      requestBody: { role: 'reader', type: 'anyone' },
    });

=======
      fields: 'id'
    });

    await drive.permissions.create({
      fileId: file.data.id!, // 👈 add the `!` to assert it's never undefined
      requestBody: { role: 'reader', type: 'anyone' }
    });
    
>>>>>>> 29cbef213ba8363836c217b7de0f333fd266ab27
    const imageUrl = `https://drive.google.com/uc?id=${file.data.id}`;

    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const groceryRepo = AppDataSource.getRepository(Grocery);
    const typeRepo = AppDataSource.getRepository(Type);
    const priceRepo = AppDataSource.getRepository(Price);
    const descriptionRepo = AppDataSource.getRepository(Description);

    let type = await typeRepo.findOne({ where: { name: req.body.type } });
    if (!type) {
      type = typeRepo.create({ name: req.body.type });
      await typeRepo.save(type);
    }

    const price = priceRepo.create({ price: parseFloat(req.body.price) });
    await priceRepo.save(price);

    const description = descriptionRepo.create({ description: req.body.description });
    await descriptionRepo.save(description);

    const grocery = groceryRepo.create({
      name: req.body.name,
      image: imageUrl,
      types: [type],
      prices: [price],
<<<<<<< HEAD
      descriptions: [description],
=======
      descriptions: [description]
>>>>>>> 29cbef213ba8363836c217b7de0f333fd266ab27
    });
    await groceryRepo.save(grocery);

    fs.unlinkSync(req.file.path);
<<<<<<< HEAD

    // Publish to RabbitMQ
    await publishToRabbit(grocery);

=======
>>>>>>> 29cbef213ba8363836c217b7de0f333fd266ab27
    res.json({ success: true, grocery });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

app.post('/api/groceries', upload.single('image'), handler);

<<<<<<< HEAD
app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));
=======
app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));
>>>>>>> 29cbef213ba8363836c217b7de0f333fd266ab27
