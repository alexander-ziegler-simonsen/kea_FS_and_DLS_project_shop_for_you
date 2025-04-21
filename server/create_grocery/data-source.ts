import 'dotenv/config'; // loads env variables
import { DataSource } from 'typeorm';
import { Grocery } from './entities/Grocery.js';
import { Type } from './entities/Type.js';
import { Price } from './entities/Price.js';
import { Description } from './entities/Description.js';
import { Deteted_Grocert } from './entities/Deteted_Grocert.js';

const connectionString = process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: connectionString,
  synchronize: true, // Set to false in production and use migrations instead
  logging: false,
  entities: [Grocery, Type, Price, Description, Deteted_Grocert],
  migrations: [],
  subscribers: [],
});
