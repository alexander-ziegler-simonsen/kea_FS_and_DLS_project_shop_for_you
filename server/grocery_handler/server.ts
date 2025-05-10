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
import { Amount } from './entities/Amount.js';
import axios from 'axios';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({ origin: 'http://127.0.0.1:5500' }));
app.use(express.json());

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

    const imgurClientId = process.env.IMGUR_CLIENT_ID;
    if (!imgurClientId) return res.status(500).json({ error: 'Imgur Client ID is not configured' });

    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(req.file.path));

      const response = await axios.post('https://api.imgur.com/3/image', formData, {
        headers: {
          Authorization: `Client-ID ${imgurClientId}`,
          ...formData.getHeaders(),
        },
      });

      const imageUrl = response.data.data.link;

      if (!AppDataSource.isInitialized) await AppDataSource.initialize();
      const groceryRepo = AppDataSource.getRepository(Grocery);
      const nameRepo = AppDataSource.getRepository(GroceryName);
      const imageRepo = AppDataSource.getRepository(GroceryImage);
      const categoryRepo = AppDataSource.getRepository(Category);
      const priceRepo = AppDataSource.getRepository(Price);
      const descRepo = AppDataSource.getRepository(Description);
      const amountRepo = AppDataSource.getRepository(Amount);

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
      const amount = amountRepo.create({ amount: parseFloat(req.body.amount) });

      await Promise.all([nameRepo.save(name), imageRepo.save(image), priceRepo.save(price), descRepo.save(desc), amountRepo.save(amount)]);

      grocery.names = [name];
      grocery.images = [image];
      grocery.categories = [category];
      grocery.prices = [price];
      grocery.descriptions = [desc];
      grocery.amounts = [amount];
      await groceryRepo.save(grocery);

      fs.unlinkSync(req.file.path);

      const fullGrocery = await groceryRepo.findOne({
        where: { id: grocery.id },
        relations: ['names', 'images', 'categories', 'prices', 'descriptions', 'amounts'],
      });
      if (fullGrocery) await publishToRabbit(fullGrocery);

      res.json({ success: true, grocery: fullGrocery });
    } catch (error) {
      console.error('Imgur upload failed:', error);
      res.status(500).json({ error: 'Failed to upload image to Imgur' });
    }
  })().catch(next);
});

// -------------------- GET ALL --------------------
app.get('/api/groceries', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const groceryRepo = AppDataSource.getRepository(Grocery);

    const groceries = await groceryRepo.find({
      relations: ['names', 'images', 'categories', 'prices', 'descriptions', 'deletedGroceries', 'amounts'],
    });

    // Filter out groceries that have been "tombstoned"
    const activeGroceries = groceries.filter(g => !g.deletedGroceries || g.deletedGroceries.length === 0);

    res.json(activeGroceries);
  })().catch(next);
});

// -------------------- GET ONE --------------------
app.get('/api/groceries/:id', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const groceryRepo = AppDataSource.getRepository(Grocery);
    const grocery = await groceryRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['names', 'images', 'categories', 'prices', 'descriptions', 'amounts'],
    });
    if (!grocery) return res.status(404).json({ error: 'Grocery not found' });
    res.json(grocery);
  })().catch(next);
});

// -------------------- UPDATE --------------------
app.post('/api/groceries/update/:id', upload.single('image'), (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const groceryRepo = AppDataSource.getRepository(Grocery);
    const nameRepo = AppDataSource.getRepository(GroceryName);
    const imageRepo = AppDataSource.getRepository(GroceryImage);
    const categoryRepo = AppDataSource.getRepository(Category);
    const priceRepo = AppDataSource.getRepository(Price);
    const descRepo = AppDataSource.getRepository(Description);
    const amountRepo = AppDataSource.getRepository(Amount);

    const existingGrocery = await groceryRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['names', 'images', 'categories', 'prices', 'descriptions', 'amounts'],
    });
    if (!existingGrocery) return res.status(404).json({ error: 'Grocery not found' });

    const updateArrayField = async <T extends { id: number }>(
      field: keyof Grocery,
      repo: { create: (data: T) => T; save: (data: T) => Promise<T> },
      newData: T[]
    ) => {
      if (newData) {
        const existingField = (existingGrocery[field] as unknown) as T[];
        const updatedField = existingField.map((item) =>
          newData.find((newItem) => newItem.id === item.id) || item
        );

        // Add new items that don't exist in the current array
        newData.forEach((newItem) => {
          if (!updatedField.some((item) => item.id === newItem.id)) {
            updatedField.push(repo.create(newItem));
          }
        });

        existingGrocery[field] = updatedField as any;
      }
    };

    await updateArrayField('names', nameRepo, req.body.names);
    await updateArrayField('images', imageRepo, req.body.images);
    await updateArrayField('categories', categoryRepo, req.body.categories);
    await updateArrayField('prices', priceRepo, req.body.prices);
    await updateArrayField('descriptions', descRepo, req.body.descriptions);
    await updateArrayField('amounts', amountRepo, req.body.amounts);

    await groceryRepo.save(existingGrocery);

    const fullGrocery = await groceryRepo.findOne({
      where: { id: existingGrocery.id },
      relations: ['names', 'images', 'categories', 'prices', 'descriptions', 'amounts'],
    });

    // Publish to RabbitMQ to update in MongoDB
    const url = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;
    try {
      const connection = await amqp.connect(url);
      const channel = await connection.createChannel();
      const exchange = 'grocery-exchange';
      const routingKey = 'grocery.updated';

      await channel.assertExchange(exchange, 'topic', { durable: false });
      channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(fullGrocery)));

      setTimeout(() => connection.close(), 500);
    } catch (err) {
      console.error('RabbitMQ publish failed:', err);
    }

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

    // Publish to RabbitMQ to delete from MongoDB
    const url = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;
    try {
      const connection = await amqp.connect(url);
      const channel = await connection.createChannel();
      const exchange = 'grocery-exchange';
      const routingKey = 'grocery.deleted';

      await channel.assertExchange(exchange, 'topic', { durable: false });
      channel.publish(exchange, routingKey, Buffer.from(JSON.stringify({ id: grocery.id })));

      setTimeout(() => connection.close(), 500);
    } catch (err) {
      console.error('RabbitMQ publish failed:', err);
    }

    res.status(204).send();
  })().catch(next);
});

app.listen(3005, () => console.log('🚀 Server running at http://localhost:3005'));
