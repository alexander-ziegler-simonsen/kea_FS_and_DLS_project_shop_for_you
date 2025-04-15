import 'dotenv/config'; // loads env variables
import { DataSource } from 'typeorm';
import { Grocery } from './entities/Grocery';
import { Type } from './entities/Type';
import { Price } from './entities/Price';
import { Description } from './entities/Description';
import { Deteted_Grocert } from './entities/Deteted_Grocert';

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
