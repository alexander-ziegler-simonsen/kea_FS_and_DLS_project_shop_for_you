import { MongoClient } from 'mongodb';

export async function connectMongo(): Promise<MongoClient> {
  const url = `mongodb://${process.env.MON_USERNAME}:${process.env.MON_PASSWORD}@${process.env.MON_HOST}:${process.env.MON_PORT}`;
  return MongoClient.connect(url);
}
