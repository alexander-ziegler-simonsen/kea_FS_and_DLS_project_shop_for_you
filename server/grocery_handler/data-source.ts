import { DataSource } from 'typeorm';
import 'dotenv/config';

import { Grocery } from './entities/Grocery.js';
import { GroceryName } from './entities/GroceryName.js';
import { GroceryImage } from './entities/GroceryImage.js';
import { Category } from './entities/Category.js';
import { Price } from './entities/Price.js';
import { Description } from './entities/Description.js';
import { Deleted_Grocery } from './entities/Deleted_Grocery.js';






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
  ],
  migrations: [],
  subscribers: [],
});

export default AppDataSource;
