import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
import { connectMongo } from './mongo-connection.js';
import { SelectQueryBuilder } from 'typeorm';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({ origin: ['http://127.0.0.1:5500', 'http://localhost:8080'] }));
app.use(express.json());

async function publishToRabbit(grocery: any) {
  const url = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;
  try {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    const exchange = 'grocery-exchange';
    const queueName = 'grocery-queue'; // Use a named queue
    const routingKey = 'grocery.created';

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queueName, {
      durable: true,       // Ensure the queue is durable if you need message persistence
      exclusive: false,    // Make it non-exclusive to allow multiple connections
      autoDelete: false,   // Prevent auto-deletion
    });

    await channel.bindQueue(queueName, exchange, routingKey);
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(grocery)));

    setTimeout(() => connection.close(), 500);
  } catch (err) {
    console.error('RabbitMQ publish failed:', err);
  }
}

const addOrdering = (sort: any, ordering: string | undefined) => {
  if (!ordering) return;
  if (ordering === 'price-asc') sort['prices.0.price'] = 1; // Sort by the first price in the array
  if (ordering === 'price-desc') sort['prices.0.price'] = -1;
  if (ordering === 'name-asc') sort['names.0.name'] = 1; // Sort by the first name in the array
  if (ordering === 'name-desc') sort['names.0.name'] = -1;
};

const addCategoryFilter = (query: any, categoryId: string | undefined) => {
  if (categoryId) {
    query.categories = { $elemMatch: { id: parseInt(categoryId) } }; // Match any category with the given ID
  }
};

const addSearchFilter = (query: any, searchText: string | undefined) => {
  if (searchText) {
    query['names.0.name'] = { $regex: searchText, $options: 'i' }; // Search by the first name in the array
  }
};

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
    try {
      const mongoClient = await connectMongo();
      const db = mongoClient.db(process.env.MON_DB || 'mirror');
      const groceriesCollection = db.collection('groceries');

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const ordering = req.query.ordering as string | undefined;
      const categoryId = req.query.categoryId as string | undefined;
      const searchText = req.query.searchText as string | undefined;

      const sort: any = {};
      const query: any = {};

      addOrdering(sort, ordering);
      addCategoryFilter(query, categoryId);
      addSearchFilter(query, searchText);

      const groceries = await groceriesCollection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalItems = await groceriesCollection.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limit);
      const nextPage = page < totalPages ? page + 1 : null;

      res.json({
        results: groceries,
        totalItems,
        currentPage: page,
        totalPages,
        nextPage,
      });

      await mongoClient.close();
    } catch (error) {
      console.error('Error fetching groceries from MongoDB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })().catch(next);
});

// -------------------- GET ONE --------------------
app.get('/api/groceries/:id', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const mongoClient = await connectMongo();
      const db = mongoClient.db(process.env.MON_DB || 'mirror');
      const groceriesCollection = db.collection('groceries');

      const grocery = await groceriesCollection.findOne({ id: parseInt(req.params.id) });

      if (!grocery) return res.status(404).json({ error: 'Grocery not found' });

      res.json(grocery);
      await mongoClient.close();
    } catch (error) {
      console.error('Error fetching grocery from MongoDB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
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

      await channel.assertExchange(exchange, 'topic', { durable: true });
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

      await channel.assertExchange(exchange, 'topic', { durable: true });
      channel.publish(exchange, routingKey, Buffer.from(JSON.stringify({ id: grocery.id })));

      setTimeout(() => connection.close(), 500);
    } catch (err) {
      console.error('RabbitMQ publish failed:', err);
    }

    res.status(204).send();
  })().catch(next);
});

// -------------------- GET UNIQUE CATEGORIES --------------------
app.get('/api/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mongoClient = await connectMongo();
    const db = mongoClient.db(process.env.MON_DB || 'mirror');
    const groceriesCollection = db.collection('groceries');

    // Fetch all unique categories from the groceries collection in alphabetical order
    const categories = await groceriesCollection.aggregate([
      { $unwind: "$categories" }, // Unwind the categories array
      { $group: { _id: "$categories.id", name: { $first: "$categories.name" } } }, // Group by category ID
      { $project: { id: "$_id", name: 1, _id: 0 } }, // Format the output
      { $sort: { name: 1 } } // Sort by name in ascending order
    ]).toArray();

    res.json({ categories });
    await mongoClient.close();
  } catch (error) {
    console.error('Failed to fetch categories from MongoDB:', error);
    next(error);
  }
});

// -------------------- UPLOAD TO IMGUR --------------------
app.post('/api/upload-to-imgur', upload.single('image'), (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imgurClientId = process.env.IMGUR_CLIENT_ID;
    if (!imgurClientId) {
      return res.status(500).json({ error: 'Imgur Client ID is not configured' });
    }

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
      fs.unlinkSync(req.file.path); // Clean up the uploaded file
      res.json({ link: imageUrl });
    } catch (error) {
      console.error('Failed to upload image to Imgur:', error);
      res.status(500).json({ error: 'Failed to upload image to Imgur' });
    }
  })().catch(next);
});

async function startQuantityUpdateConsumer() {
  const url = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;
  try {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    await channel.assertExchange('grocery-exchange', 'topic', { durable: true });

    const queue = await channel.assertQueue('', { exclusive: true });
    channel.bindQueue(queue.queue, 'grocery-exchange', 'grocery.quantity.update');

    channel.consume(queue.queue, async (msg) => {
      if (msg) {
        const { groceryname, groceryamount } = JSON.parse(msg.content.toString());

        if (!AppDataSource.isInitialized) await AppDataSource.initialize();
        const groceryRepo = AppDataSource.getRepository(Grocery);

        const grocery = await groceryRepo.findOne({
          where: { names: { name: groceryname } },
          relations: ['amounts'],
        });

        if (grocery) {
          grocery.amounts.forEach((amount) => {
            amount.amount -= groceryamount;
          });
          await groceryRepo.save(grocery);
          console.log(`Updated quantity for grocery: ${groceryname}`);
        } else {
          console.error(`Grocery not found: ${groceryname}`);
        }

        channel.ack(msg);
      }
    });

    console.log('🚀 Listening for grocery.quantity.update messages...');
  } catch (err) {
    console.error('Failed to start quantity update consumer:', err);
  }
}

startQuantityUpdateConsumer();

app.listen(3005, () => console.log('🚀 Server running at http://localhost:3005'));
