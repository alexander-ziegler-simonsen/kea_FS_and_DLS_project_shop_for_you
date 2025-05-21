import { MongoClient } from 'mongodb';

export async function connectMongo(): Promise<MongoClient> {
  // Prefer a full connection string from env (for Atlas or custom setups)
  const url = process.env.MON_URL || `mongodb://${process.env.MON_USERNAME}:${process.env.MON_PASSWORD}@${process.env.MON_HOST}:${process.env.MON_PORT}`;
  return MongoClient.connect(url);
}
