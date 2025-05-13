import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import AppDataSource from './data-source.js';
import { Order } from './entities/Order.js';
import { Orderline } from './entities/Orderline.js';

const app = express();

// Establish database connection
AppDataSource.initialize().then(() => {
  console.log('📦 Database connected successfully');
}).catch((error) => {
  console.error('❌ Database connection failed:', error);
});

app.use(cors({ origin: 'http://127.0.0.1:5500' }));
app.use(express.json());

// -------------------- CREATE ORDER --------------------
app.post('/api/orders', async (req: Request, res: Response, next: NextFunction) => {
  const orderRepository = AppDataSource.getRepository(Order);
  const { username, email, address, totalprice } = req.body;

  try {
    const order = orderRepository.create({ username, email, address, totalprice });
    await orderRepository.save(order);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// -------------------- GET ALL ORDERS --------------------
app.get('/api/orders', async (req: Request, res: Response) => {
  const orderRepository = AppDataSource.getRepository(Order);

  try {
    const orders = await orderRepository.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// -------------------- CREATE ORDERLINE --------------------
app.post('/api/orderlines', async (req: Request, res: Response, next: NextFunction) => {
  const orderlineRepository = AppDataSource.getRepository(Orderline);
  const { username, email, address, groceryname, groceryamount, pricename } = req.body;

  try {
    const orderline = orderlineRepository.create({ username, email, address, groceryname, groceryamount, pricename });
    await orderlineRepository.save(orderline);
    res.status(201).json(orderline);
  } catch (error) {
    next(error);
  }
});

// -------------------- GET ALL ORDERLINES --------------------
app.get('/api/orderlines', async (req: Request, res: Response) => {
  const orderlineRepository = AppDataSource.getRepository(Orderline);

  try {
    const orderlines = await orderlineRepository.find();
    res.json(orderlines);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Error handling middleware
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'An unknown error occurred' });
  }
});

app.listen(3007, () => console.log('🚀 Order handler server running at http://localhost:3007'));