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

app.use(cors({ origin: ['http://127.0.0.1:5500', 'http://localhost:8080',  'http://localhost:30081', "https://kea-fs-and-dls-project-shop-for-you.onrender.com"] }));
app.use(express.json());

async function publishToRabbit(grocery: any) {
  const url = getRabbitUrl();
  const logFilePath = '/var/log/grocery-handler/grocery-handler.log';

  try {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    const exchange = 'grocery-exchange';
    const queueName = 'grocery-queue';
    const routingKey = 'grocery.created';

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queueName, {
      durable: true,
      exclusive: false,
      autoDelete: false,
    });

    await channel.bindQueue(queueName, exchange, routingKey);
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(grocery)));

    // Log the event to the file
    const logMessage = `Published grocery to RabbitMQ: ${JSON.stringify(grocery)}\n`;
    fs.appendFileSync(logFilePath, logMessage);

    setTimeout(() => connection.close(), 500);
  } catch (err) {
    const errorMessage = `RabbitMQ publish failed: ${err}\n`;
    console.error(errorMessage);

    // Log the error to the file
    fs.appendFileSync(logFilePath, errorMessage);
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
app.post('/api/groceries', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    // Accept type as an array of category names
    const { name, type, price, description, amount, image } = req.body;
    if (!image) return res.status(400).json({ error: 'Image URL is required' });

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

    const nameEntity = nameRepo.create({ name });
    const imageEntity = imageRepo.create({ image });

    // Handle multiple categories
    let categories: Category[] = [];
    if (Array.isArray(type)) {
      for (const catName of type) {
        let category = await categoryRepo.findOne({ where: { name: catName } });
        if (!category) {
          category = categoryRepo.create({ name: catName });
          await categoryRepo.save(category);
        }
        categories.push(category);
      }
    } else if (typeof type === 'string') {
      let category = await categoryRepo.findOne({ where: { name: type } });
      if (!category) {
        category = categoryRepo.create({ name: type });
        await categoryRepo.save(category);
      }
      categories.push(category);
    }

    const priceEntity = priceRepo.create({ price: parseFloat(price) });
    const descEntity = descRepo.create({ description });
    const amountEntity = amountRepo.create({ amount: parseFloat(amount) });

    await Promise.all([
      nameRepo.save(nameEntity),
      imageRepo.save(imageEntity),
      priceRepo.save(priceEntity),
      descRepo.save(descEntity),
      amountRepo.save(amountEntity),
    ]);

    grocery.names = [nameEntity];
    grocery.images = [imageEntity];
    grocery.categories = categories;
    grocery.prices = [priceEntity];
    grocery.descriptions = [descEntity];
    grocery.amounts = [amountEntity];
    await groceryRepo.save(grocery);

    const fullGrocery = await groceryRepo.findOne({
      where: { id: grocery.id },
      relations: ['names', 'images', 'categories', 'prices', 'descriptions', 'amounts'],
    });
    if (fullGrocery) await publishToRabbit(fullGrocery);

    res.json({ success: true, grocery: fullGrocery });
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

    // --- Special handling for categories: overwrite only if changed ---
    if (Array.isArray(req.body.categories)) {
      const categoryNames = req.body.categories.map((cat: any) => cat.name).sort();
      const currentCategoryNames = (existingGrocery.categories || []).map((cat: any) => cat.name).sort();
      const isCategoriesChanged = JSON.stringify(categoryNames) !== JSON.stringify(currentCategoryNames);
      if (isCategoriesChanged) {
        const categories = [];
        for (const catName of categoryNames) {
          let category = await categoryRepo.findOne({ where: { name: catName } });
          if (!category) {
            category = categoryRepo.create({ name: catName });
            await categoryRepo.save(category);
          }
          categories.push(category);
        }
        existingGrocery.categories = categories;
      }
    }

    // --- Update other array fields as before ---
    const updateArrayField = async <T extends { id: number }>(
      field: keyof Grocery,
      repo: { create: (data: T) => T; save: (data: T) => Promise<T> },
      newData: T[]
    ) => {
      if (newData && field !== 'categories') { // skip categories, handled above
        const existingField = (existingGrocery[field] as unknown) as T[];
        const updatedField = existingField.map((item) =>
          newData.find((newItem) => newItem.id === item.id) || item
        );
        newData.forEach((newItem) => {
          if (!updatedField.some((item) => item.id === newItem.id)) {
            updatedField.push(repo.create(newItem));
          }
        });
        existingGrocery[field] = updatedField as any;
      }
    };

    // --- Dirty-checking and add-only update for names ---
    if (Array.isArray(req.body.names)) {
      const newNames = req.body.names.map((n: any) => n.name);
      const currentNames = (existingGrocery.names || []).map((n: any) => n.name);
      const namesToAdd = newNames.filter((name: string) => !currentNames.includes(name));
      if (namesToAdd.length > 0) {
        for (const name of namesToAdd) {
          let nameEntity = await nameRepo.findOne({ where: { name } });
          if (!nameEntity) {
            nameEntity = nameRepo.create({ name });
            await nameRepo.save(nameEntity);
          }
          existingGrocery.names.push(nameEntity);
        }
      }
    }

    // --- Dirty-checking and add-only update for images ---
    if (Array.isArray(req.body.images)) {
      const newImages = req.body.images.map((img: any) => img.image);
      const currentImages = (existingGrocery.images || []).map((img: any) => img.image);
      const imagesToAdd = newImages.filter((image: string) => !currentImages.includes(image));
      if (imagesToAdd.length > 0) {
        for (const image of imagesToAdd) {
          let imageEntity = await imageRepo.findOne({ where: { image } });
          if (!imageEntity) {
            imageEntity = imageRepo.create({ image });
            await imageRepo.save(imageEntity);
          }
          existingGrocery.images.push(imageEntity);
        }
      }
    }

    // --- Dirty-checking and add-only update for prices ---
    if (Array.isArray(req.body.prices)) {
      const newPrices = req.body.prices.map((p: any) => p.price);
      const currentPrices = (existingGrocery.prices || []).map((p: any) => p.price);
      const pricesToAdd = newPrices.filter((price: number) => !currentPrices.includes(price));
      if (pricesToAdd.length > 0) {
        for (const price of pricesToAdd) {
          let priceEntity = await priceRepo.findOne({ where: { price } });
          if (!priceEntity) {
            priceEntity = priceRepo.create({ price });
            await priceRepo.save(priceEntity);
          }
          existingGrocery.prices.push(priceEntity);
        }
      }
    }

    // --- Dirty-checking and add-only update for descriptions ---
    if (Array.isArray(req.body.descriptions)) {
      const newDescs = req.body.descriptions.map((d: any) => d.description);
      const currentDescs = (existingGrocery.descriptions || []).map((d: any) => d.description);
      const descsToAdd = newDescs.filter((description: string) => !currentDescs.includes(description));
      if (descsToAdd.length > 0) {
        for (const description of descsToAdd) {
          let descEntity = await descRepo.findOne({ where: { description } });
          if (!descEntity) {
            descEntity = descRepo.create({ description });
            await descRepo.save(descEntity);
          }
          existingGrocery.descriptions.push(descEntity);
        }
      }
    }

    // --- Only create a new Amount entity if the value is different from the latest ---
    if (Array.isArray(req.body.amounts)) {
      const newAmounts = req.body.amounts.map((a: any) => a.amount);
      // Assume only one amount per update (if multiple, use the last one)
      const newAmount = newAmounts[newAmounts.length - 1];
      const currentAmounts = existingGrocery.amounts || [];
      const latestAmount = currentAmounts.length > 0 ? currentAmounts[currentAmounts.length - 1].amount : undefined;
      if (latestAmount !== newAmount) {
        const amountEntity = amountRepo.create({ amount: newAmount });
        await amountRepo.save(amountEntity);
        existingGrocery.amounts = [...currentAmounts, amountEntity];
      }
      // If the same, do nothing (keep existing amounts)
    }

    await groceryRepo.save(existingGrocery);

    const fullGrocery = await groceryRepo.findOne({
      where: { id: existingGrocery.id },
      relations: ['names', 'images', 'categories', 'prices', 'descriptions', 'amounts'],
    });

    // Publish to RabbitMQ to update in MongoDB
    const url = getRabbitUrl();
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
    const url = getRabbitUrl();
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

function getRabbitUrl(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const protocol = isProd ? 'amqps' : 'amqp';
  const vhost = process.env.RABBIT_VHOST;
  const vhostPart = vhost ? `/${encodeURIComponent(vhost)}` : '';
  return `${protocol}://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}${vhostPart}`;
}

async function startQuantityUpdateConsumer() {
  const url = getRabbitUrl();

  try {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    await channel.assertExchange('grocery-exchange', 'topic', { durable: true });

    const queue = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue.queue, 'grocery-exchange', 'grocery.quantity.update');

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
          console.log(`✅ Updated quantity for grocery: ${groceryname}`);
        } else {
          console.error(`❌ Grocery not found: ${groceryname}`);
        }

        channel.ack(msg);
      }
    });

    console.log('🚀 Listening for grocery.quantity.update messages...');
  } catch (err) {
    console.error('❌ Failed to start quantity update consumer:', err);
  }
}

startQuantityUpdateConsumer();

app.listen(3005, () => console.log('🚀 Server running at http://localhost:3005'));
