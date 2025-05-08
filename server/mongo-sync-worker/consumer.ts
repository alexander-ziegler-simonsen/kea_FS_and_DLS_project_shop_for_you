import 'dotenv/config';
import rhea from 'rhea';
const connect = rhea.connect;
import { MongoClient } from 'mongodb';

const sleep = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

async function connectMongo(retries = 5): Promise<MongoClient> {
  const url = `mongodb://${process.env.MON_USERNAME}:${process.env.MON_PASSWORD}@${process.env.MON_HOST}:${process.env.MON_PORT}`;

  for (let i = 0; i < retries; i++) {
    try {
      const client = await MongoClient.connect(url);
      console.log('✅ Connected to MongoDB');
      return client;
    } catch (err) {
      console.log(`❌ MongoDB connection failed. Retry ${i + 1}/${retries}:`, (err as Error).message);
      await sleep(3000);
    }
  }
  throw new Error('💥 Failed to connect to MongoDB after retries.');
}

async function startConsumer(): Promise<void> {
  const mongo = await connectMongo();
  const db = mongo.db(process.env.MON_DB || 'mirror');
  const groceries = db.collection('groceries');

  const connection = connect({
    host: process.env.RABBIT_HOST,
    port: parseInt(process.env.RABBIT_PORT || '5672', 10),
    username: process.env.RABBIT_USERNAME,
    password: process.env.RABBIT_PASSWORD,
  });

  connection.on('connection_open', () => {
    console.log('✅ Connected to RabbitMQ via rhea');

    const receiverOptions = {
      source: {
        address: 'grocery.created',
      },
    };

    const receiver = connection.open_receiver(receiverOptions);

    receiver.on('message', async (context: any) => {
      const message = context.message?.body;
      if (message) {
        const grocery = JSON.parse(message);
        await groceries.insertOne(grocery);
        console.log(`🍏 Synced grocery: ${grocery.name} (ID: ${grocery.id})`);
      }
    });

    receiver.on('receiver_error', (err: any) => {
      console.error('❌ Receiver error:', err);
    });
  });

  connection.on('connection_error', (err: any) => {
    console.error('❌ Connection error:', err);
  });

  connection.on('disconnected', () => {
    console.log('❌ Disconnected from RabbitMQ');
  });

  console.log('🚀 Mongo sync worker is now listening for grocery.created messages...');
}

startConsumer();