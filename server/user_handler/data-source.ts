import { DataSource } from 'typeorm';
import 'dotenv/config';

import { User } from './entities/User.js';

const connectionString = process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: connectionString,
  synchronize: true, // Set to false in production and use migrations instead
  logging: false,
  entities: [
    User,
  ],
  migrations: [],
  subscribers: [],
});

export default AppDataSource;
