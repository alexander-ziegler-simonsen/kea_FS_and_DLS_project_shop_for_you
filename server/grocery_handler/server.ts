import express, { Request, Response, NextFunction } from 'express';
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
import { Deleted_Grocery } from './entities/Deleted_Grocery.js';

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

    setTimeout(() => connection.close(), 500);
  } catch (err) {
    console.error('RabbitMQ publish failed:', err);
  }
}

// -------------------- CREATE --------------------
app.post('/api/groceries', upload.single('image'), (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    if (!req.file) return res.status(400).json({ error: 'Image file is required' });

    const fileMetadata = {
      name: req.file.originalname,
      parents: ['12_zMly4eQvoggqV6ot1WuLrlfgyxQIse'],
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };
    const file = await drive.files.create({ requestBody: fileMetadata, media, fields: 'id' });
    await drive.permissions.create({ fileId: file.data.id!, requestBody: { role: 'reader', type: 'anyone' } });
    const imageUrl = `https://drive.google.com/uc?id=${file.data.id}`;

    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const groceryRepo = AppDataSource.getRepository(Grocery);
    const nameRepo = AppDataSource.getRepository(GroceryName);
    const imageRepo = AppDataSource.getRepository(GroceryImage);
    const categoryRepo = AppDataSource.getRepository(Category);
    const priceRepo = AppDataSource.getRepository(Price);
    const descRepo = AppDataSource.getRepository(Description);

    const grocery = groceryRepo.create({ createdAt: new Date() });
    await groceryRepo.save(grocery);

    const name = nameRepo.create({ name: req.body.name });
    const image = imageRepo.create({ image: imageUrl });
    let category = await categoryRepo.findOne({ where: { name: req.body.type } });
    if (!category) {
      category = categoryRepo.create({ name: req.body.type });
      await categoryRepo.save(category);
    }
    const price = priceRepo.create({ price: parseFloat(req.body.price) });
    const desc = descRepo.create({ description: req.body.description });

    await Promise.all([nameRepo.save(name), imageRepo.save(image), priceRepo.save(price), descRepo.save(desc)]);

    grocery.names = [name];
    grocery.images = [image];
    grocery.categories = [category];
    grocery.prices = [price];
    grocery.descriptions = [desc];
    await groceryRepo.save(grocery);

    fs.unlinkSync(req.file.path);

    const fullGrocery = await groceryRepo.findOne({
      where: { id: grocery.id },
      relations: ['names', 'images', 'categories', 'prices', 'descriptions'],
    });
    if (fullGrocery) await publishToRabbit(fullGrocery);

    res.json({ success: true, grocery: fullGrocery });
  })().catch(next);
});

// -------------------- GET ALL --------------------
app.get('/api/groceries', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const groceryRepo = AppDataSource.getRepository(Grocery);
    const groceries = await groceryRepo.find({
      relations: ['names', 'images', 'categories', 'prices', 'descriptions'],
    });
    res.json(groceries);
  })().catch(next);
});

// -------------------- GET ONE --------------------
app.get('/api/groceries/:id', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const groceryRepo = AppDataSource.getRepository(Grocery);
    const grocery = await groceryRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['names', 'images', 'categories', 'prices', 'descriptions'],
    });
    if (!grocery) return res.status(404).json({ error: 'Grocery not found' });
    res.json(grocery);
  })().catch(next);
});

// -------------------- UPDATE --------------------
app.post('/api/groceries/update/:id', upload.single('image'), (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    if (!req.file) return res.status(400).json({ error: 'Image file is required' });

    const fileMetadata = { name: req.file.originalname, parents: ['12_zMly4eQvoggqV6ot1WuLrlfgyxQIse'] };
    const media = { mimeType: req.file.mimetype, body: fs.createReadStream(req.file.path) };
    const file = await drive.files.create({ requestBody: fileMetadata, media, fields: 'id' });
    await drive.permissions.create({ fileId: file.data.id!, requestBody: { role: 'reader', type: 'anyone' } });
    const imageUrl = `https://drive.google.com/uc?id=${file.data.id}`;

    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const groceryRepo = AppDataSource.getRepository(Grocery);
    const nameRepo = AppDataSource.getRepository(GroceryName);
    const imageRepo = AppDataSource.getRepository(GroceryImage);
    const categoryRepo = AppDataSource.getRepository(Category);
    const priceRepo = AppDataSource.getRepository(Price);
    const descRepo = AppDataSource.getRepository(Description);

    const grocery = groceryRepo.create({ createdAt: new Date() });
    await groceryRepo.save(grocery);

    const name = nameRepo.create({ name: req.body.name });
    const image = imageRepo.create({ image: imageUrl });
    let category = await categoryRepo.findOne({ where: { name: req.body.type } });
    if (!category) category = categoryRepo.create({ name: req.body.type });
    const price = priceRepo.create({ price: parseFloat(req.body.price) });
    const desc = descRepo.create({ description: req.body.description });

    await Promise.all([nameRepo.save(name), imageRepo.save(image), priceRepo.save(price), descRepo.save(desc)]);

    grocery.names = [name];
    grocery.images = [image];
    grocery.categories = [category];
    grocery.prices = [price];
    grocery.descriptions = [desc];
    await groceryRepo.save(grocery);

    fs.unlinkSync(req.file.path);

    const fullGrocery = await groceryRepo.findOne({
      where: { id: grocery.id },
      relations: ['names', 'images', 'categories', 'prices', 'descriptions'],
    });
    res.json({ success: true, grocery: fullGrocery });
  })().catch(next);
});

// -------------------- DELETE --------------------
app.delete('/api/groceries/:id', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const groceryRepo = AppDataSource.getRepository(Grocery);
    const deletedRepo = AppDataSource.getRepository(Deleted_Grocery);

    const grocery = await groceryRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['deletedGroceries'],
    });
    if (!grocery) return res.status(404).json({ error: 'Grocery not found' });

    const deletedEntry = deletedRepo.create({ deletedAt: new Date() });
    await deletedRepo.save(deletedEntry);

    grocery.deletedGroceries = [...(grocery.deletedGroceries || []), deletedEntry];
    await groceryRepo.save(grocery);

    res.status(204).send();
  })().catch(next);
});

app.listen(3005, () => console.log('🚀 Server running at http://localhost:3005'));
