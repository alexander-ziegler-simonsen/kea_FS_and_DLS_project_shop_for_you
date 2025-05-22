import 'dotenv/config';
import amqp from 'amqplib';
import { connectMongo } from './mongo-connection.js';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function connectRabbit(retries = 15) {
  function getRabbitUrl() {
    const isProd = process.env.NODE_ENV === 'production';
    const protocol = isProd ? 'amqps' : 'amqp';
    const vhost = process.env.RABBIT_VHOST;
    const vhostPart = vhost ? `/${encodeURIComponent(vhost)}` : '';
    return `${protocol}://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}${vhostPart}`;
  }

  const url = getRabbitUrl();

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to connect to RabbitMQ at ${url}`);
      const connection = await amqp.connect(url);
      console.log('✅ Connected to RabbitMQ');
      return connection;
    } catch (err) {
      console.log(`❌ RabbitMQ connection failed. Retry ${i + 1}/${retries}:`, err.message);
      console.error('Full error details:', err);
      await sleep(3000); // Ensure sleep is defined elsewhere in your code
    }
  }

  throw new Error('💥 Failed to connect to RabbitMQ after retries.');
}

// Retry wrapper for connectMongo from mongo-connection.ts
async function connectMongoWithRetry(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await connectMongo();
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
  await channel.assertExchange('grocery-exchange', 'topic', { durable: true });

  // Use named, non-exclusive queues
  await channel.assertQueue('grocery-queue-created', { durable: true, exclusive: false, autoDelete: false });
  await channel.assertQueue('grocery-queue-deleted', { durable: true, exclusive: false, autoDelete: false });
  await channel.assertQueue('grocery-queue-updated', { durable: true, exclusive: false, autoDelete: false });

  // Bind named queues
  channel.bindQueue('grocery-queue-created', 'grocery-exchange', 'grocery.created');
  channel.bindQueue('grocery-queue-deleted', 'grocery-exchange', 'grocery.deleted');
  channel.bindQueue('grocery-queue-updated', 'grocery-exchange', 'grocery.updated');

  // Use retry wrapper for MongoDB connection
  const mongo = await connectMongoWithRetry();
  const db = mongo.db(process.env.MON_DB || 'mirror');
  const groceries = db.collection('groceries');

  // Consumer for created groceries
  channel.consume('grocery-queue-created', async (msg) => {
    if (msg) {
      try {
        const grocery = JSON.parse(msg.content.toString());
        await groceries.insertOne(grocery);
        console.log(`🍏 Synced grocery: ${grocery.id}`);
        channel.ack(msg);
      } catch (error) {
        console.error('❌ Failed to insert grocery into Mongo:', error.message);
        channel.ack(msg);
      }
    }
  });

  // Consumer for deleted groceries
  channel.consume('grocery-queue-deleted', async (msg) => {
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
channel.consume('grocery-queue-updated', async (msg) => {
    if (msg) {
        try {
            const grocery = JSON.parse(msg.content.toString());

            // Process the grocery object to only keep the latest name
            if (grocery.names && Array.isArray(grocery.names)) {
                grocery.names = [grocery.names.reduce((latest, current) =>
                    new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                )];
            }

            // Process the grocery object to only keep the latest image
            if (grocery.images && Array.isArray(grocery.images)) {
                grocery.images = [grocery.images.reduce((latest, current) =>
                    new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                )];
            }

            // Do NOT reduce categories, keep all

            // Process the grocery object to only keep the latest price
            if (grocery.prices && Array.isArray(grocery.prices)) {
                grocery.prices = [grocery.prices.reduce((latest, current) =>
                    new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                )];
            }

            // Process the grocery object to only keep the latest description
            if (grocery.descriptions && Array.isArray(grocery.descriptions)) {
                grocery.descriptions = [grocery.descriptions.reduce((latest, current) =>
                    new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                )];
            }

            // Process the grocery object to only keep the latest amount
            if (grocery.amounts && Array.isArray(grocery.amounts)) {
                grocery.amounts = [grocery.amounts.reduce((latest, current) =>
                    new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                )];
            }

            await groceries.replaceOne({ id: grocery.id }, grocery, { upsert: true });
            console.log(`✏️ Updated grocery: ${grocery.id}`);
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
