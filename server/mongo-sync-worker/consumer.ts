import 'dotenv/config';
import rhea from 'rhea';
const connect = rhea.connect;
import { MongoClient } from 'mongodb';

const sleep = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

async function connectMongo(retries = 5): Promise<MongoClient> {
  const url = `mongodb://${process.env.MON_USERNAME}:${process.env.MON_PASSWORD}@${process.env.MON_HOST}:${process.env.MON_PORT}`;

  for (let i = 0; i < retries; i++) {
    try {
      const client = await MongoClient.connect(url);
      console.log('✅ Connected to MongoDB');
      return client;
    } catch (err) {
      console.log(
        `❌ MongoDB connection failed. Retry ${i + 1}/${retries}:`,
        (err as Error).message
      );
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

    const receiver = connection.open_receiver({
      source: { address: 'grocery.created' },
    });

    receiver.on('message', async (context: any) => {
      try {
        const message = context.message?.body;
        if (!message) return;

        const grocery = JSON.parse(message);

        const mongoDoc = {
          ...grocery,
          flatName: grocery.names?.[0]?.name || 'unknown',
          flatCategory: grocery.categories?.[0]?.name || 'unknown',
        };

        await groceries.insertOne(mongoDoc);

        console.log(`🍏 Synced grocery: ${mongoDoc.flatName} (ID: ${grocery.id})`);
      } catch (err) {
        console.error('❌ Failed to process grocery message:', (err as Error).message);
      }
    });

    receiver.on('receiver_error', (err: any) => {
      console.error('❌ Receiver error:', err);
    });

    const receiverUpdated = connection.open_receiver({
      source: { address: 'grocery.updated' },
    });

    receiverUpdated.on('message', async (context: any) => {
      try {
        const message = context.message?.body;
        if (!message) return;

        const grocery = JSON.parse(message);

        const updateFields: any = {};
        if (grocery.names?.[0]?.name) updateFields.flatName = grocery.names[0].name;
        if (grocery.categories?.[0]?.name) updateFields.flatCategory = grocery.categories[0].name;
        if (grocery.images?.[0]?.image) updateFields.image = grocery.images[0].image;
        if (grocery.prices?.[0]?.price) updateFields.price = grocery.prices[0].price;
        if (grocery.descriptions?.[0]?.description) updateFields.description = grocery.descriptions[0].description;

        const result = await groceries.updateOne(
          { id: grocery.id },
          { $set: updateFields },
          { upsert: false }
        );

        if (result.modifiedCount > 0) {
          console.log(`✏️ Updated grocery: ${updateFields.flatName || 'unknown'} (ID: ${grocery.id})`);
        } else {
          console.warn(`⚠️ No changes made for grocery with ID: ${grocery.id}`);
        }
      } catch (err) {
        console.error('❌ Failed to process updated grocery message:', (err as Error).message);
      }
    });

    receiverUpdated.on('receiver_error', (err: any) => {
      console.error('❌ Receiver error for updated groceries:', err);
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

console.log('🟢 This is consumer.ts');


startConsumer();
