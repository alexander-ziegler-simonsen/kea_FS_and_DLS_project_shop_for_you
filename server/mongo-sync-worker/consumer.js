import 'dotenv/config';
import amqp from 'amqplib';
import { MongoClient } from 'mongodb';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function connectRabbit(retries = 5) {
  const url = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;

  for (let i = 0; i < retries; i++) {
    try {
      const connection = await amqp.connect(url);
      console.log('✅ Connected to RabbitMQ');
      return connection;
    } catch (err) {
      console.log(`❌ RabbitMQ connection failed. Retry ${i + 1}/${retries}:`, err.message);
      await sleep(3000);
    }
  }
  throw new Error('💥 Failed to connect to RabbitMQ after retries.');
}

async function connectMongo(retries = 5) {
  const url = `mongodb://${process.env.MON_USERNAME}:${process.env.MON_PASSWORD}@${process.env.MON_HOST}:${process.env.MON_PORT}`;

  for (let i = 0; i < retries; i++) {
    try {
      const client = await MongoClient.connect(url);
      console.log('✅ Connected to MongoDB');
      return client;
    } catch (err) {
      console.log(`❌ MongoDB connection failed. Retry ${i + 1}/${retries}:`, err.message);
      await sleep(3000);
    }
  }
  throw new Error('💥 Failed to connect to MongoDB after retries.');
}

async function startConsumer() {
  const conn = await connectRabbit();
  const channel = await conn.createChannel();
  await channel.assertExchange('grocery-exchange', 'topic', { durable: false });

  const qCreated = await channel.assertQueue('', { exclusive: true });
  channel.bindQueue(qCreated.queue, 'grocery-exchange', 'grocery.created');

  const qDeleted = await channel.assertQueue('', { exclusive: true });
  channel.bindQueue(qDeleted.queue, 'grocery-exchange', 'grocery.deleted');

  const qUpdated = await channel.assertQueue('', { exclusive: true });
  channel.bindQueue(qUpdated.queue, 'grocery-exchange', 'grocery.updated');

  const mongo = await connectMongo();
  const db = mongo.db(process.env.MON_DB || 'mirror');
  const groceries = db.collection('groceries');

  // Consumer for created groceries
  channel.consume(qCreated.queue, async (msg) => {
    if (msg) {
      try {
        const grocery = JSON.parse(msg.content.toString());

        const mongoDoc = {
          ...grocery,
          name: grocery.names?.[0]?.name || 'unknown',
          category: grocery.categories?.[0]?.name || 'unknown',
          image: grocery.images?.[0]?.image || 'none',
          price: grocery.prices?.[0]?.price || 0,
          description: grocery.descriptions?.[0]?.description || '',
          flatName: grocery.names?.[0]?.name || 'unknown',
          flatCategory: grocery.categories?.[0]?.name || 'unknown',
        };

        await groceries.insertOne(mongoDoc);

        console.log(`🍏 Synced grocery: ${mongoDoc.flatName} (ID: ${grocery.id})`);
        channel.ack(msg);
      } catch (error) {
        console.error('❌ Failed to insert grocery into Mongo:', error.message);
        channel.ack(msg);
      }
    }
  });

  // Consumer for deleted groceries
  channel.consume(qDeleted.queue, async (msg) => {
    if (msg) {
      try {
        const { id } = JSON.parse(msg.content.toString());

        const result = await groceries.deleteOne({ id });

        if (result.deletedCount > 0) {
          console.log(`🗑️ Deleted grocery with ID: ${id} from MongoDB`);
        } else {
          console.warn(`⚠️ Grocery with ID: ${id} not found in MongoDB`);
        }

        channel.ack(msg);
      } catch (error) {
        console.error('❌ Failed to delete grocery from Mongo:', error.message);
        channel.ack(msg);
      }
    }
  });

  // Consumer for updated groceries
  channel.consume(qUpdated.queue, async (msg) => {
    if (msg) {
      try {
        const grocery = JSON.parse(msg.content.toString());

        // Fetch the existing grocery document
        const existingGrocery = await groceries.findOne({ id: grocery.id });

        if (!existingGrocery) {
          // If the grocery doesn't exist, insert it as a new document
          await groceries.insertOne(grocery);
          console.log(`🍏 Inserted new grocery: ${grocery.id}`);
        } else {
          // Update only the specific `id` in each array
          const updatedGrocery = { ...existingGrocery };

          const updateArrayField = (field) => {
            if (grocery[field]) {
              updatedGrocery[field] = existingGrocery[field]?.map((item) =>
                grocery[field].find((newItem) => newItem.id === item.id) || item
              ) || [];

              // Add new items that don't exist in the current array
              grocery[field].forEach((newItem) => {
                if (!updatedGrocery[field].some((item) => item.id === newItem.id)) {
                  updatedGrocery[field].push(newItem);
                }
              });
            }
          };

          // Update all relevant fields
          ['names', 'categories', 'images', 'prices', 'descriptions', 'amounts'].forEach(updateArrayField);

          // Replace the document with the updated data
          await groceries.replaceOne({ id: grocery.id }, updatedGrocery);
          console.log(`✏️ Updated grocery: ${grocery.id}`);
        }

        channel.ack(msg);
      } catch (error) {
        console.error('❌ Failed to update grocery in Mongo:', error.message);
        channel.ack(msg);
      }
    }
  });

  console.log('🚀 Mongo sync worker is now listening for grocery.created, grocery.deleted, and grocery.updated messages...');
}

console.log('🟡 This is consumer.js');


startConsumer();
