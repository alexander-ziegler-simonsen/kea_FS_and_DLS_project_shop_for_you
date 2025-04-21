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

  const q = await channel.assertQueue('', { exclusive: true });
  channel.bindQueue(q.queue, 'grocery-exchange', 'grocery.created');

  const mongo = await connectMongo();
  const db = mongo.db(process.env.MON_DB || 'mirror');
  const groceries = db.collection('groceries');

  channel.consume(q.queue, async (msg) => {
    if (msg) {
      const grocery = JSON.parse(msg.content.toString());
      await groceries.insertOne(grocery);
      console.log(`🍏 Synced grocery: ${grocery.name} (ID: ${grocery.id})`);
      channel.ack(msg);
    }
  });

  console.log('🚀 Mongo sync worker is now listening for grocery.created messages...');
}

startConsumer();