import 'dotenv/config'; // loads env variables
import { DataSource } from 'typeorm';
import { Grocery } from './entities/Grocery';
import { GroceryName } from './entities/GroceryName';
import { GroceryImage } from './entities/GroceryImage';
import { Category } from './entities/Category';
import { Price } from './entities/Price';
import { Description } from './entities/Description';
import { Deleted_Grocery } from './entities/Deleted_Grocery';
import { Amount } from './entities/Amount';
import { User } from './entities/User';
import { Order } from './entities/Order';
import { Orderline } from './entities/Orderline';

const connectionString = process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: connectionString,
  synchronize: true, // Set to false in production and use migrations instead
  logging: false,
  entities: [
    Grocery,
    GroceryName,
    GroceryImage,
    Category,
    Price,
    Description,
    Deleted_Grocery,
    Amount,
    User,
    Order,
    Orderline,
  ],
  migrations: [],
  subscribers: [],
});
