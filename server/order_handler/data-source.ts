import { DataSource, Or } from 'typeorm';
import 'dotenv/config';
import { Order } from './entities/Order.js';
import { Orderline } from './entities/Orderline.js';


const connectionString = process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: connectionString,
  synchronize: true, // Set to false in production and use migrations instead
  logging: false,
  entities: [
    Order,
    Orderline,
  ],
  migrations: [],
  subscribers: [],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default AppDataSource;
