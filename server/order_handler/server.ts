import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import amqp from 'amqplib';
import AppDataSource from './data-source.js';
import { Order } from './entities/Order.js';
import { Orderline } from './entities/Orderline.js';



const app = express();
const PORT = process.env.PORT || 3007;

// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(cors({ origin: ['http://localhost:8080'] }));

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('📦 Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
  });

// Function to publish a message to RabbitMQ
async function publishToRabbit(orderlines: any[]) {
  function getRabbitUrl() {
    const isProd = process.env.NODE_ENV === 'production';
    const protocol = isProd ? 'amqps' : 'amqp';
    const vhost = process.env.RABBIT_VHOST;
    const vhostPart = vhost ? `/${encodeURIComponent(vhost)}` : '';
    return `${protocol}://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}${vhostPart}`;
  }

  const url = getRabbitUrl();

  try {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    const queue = 'order-queue';

    // Ensure the queue exists
    await channel.assertQueue(queue, { durable: true });

    for (const line of orderlines) {
      const message = {
        groceryname: line.groceryname,
        groceryamount: line.groceryamount,
      };
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
      console.log(`📦 Message published to queue '${queue}':`, message);
    }

    setTimeout(() => connection.close(), 500);
  } catch (err) {
    console.error('❌ RabbitMQ publish failed:', err);
  }
}

// POST endpoint to create an order
app.post('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, address, totalprice, orderlines } = req.body;

    const order = new Order();
    order.username = username;
    order.email = email;
    order.address = address;
    order.totalprice = totalprice;
    order.orderlines = orderlines.map((line: any) => {
      const orderline = new Orderline();
      orderline.groceryname = line.groceryname;
      orderline.groceryamount = line.groceryamount;
      orderline.price = line.price;
      return orderline;
    });

    const orderRepository = AppDataSource.getRepository(Order);
    const savedOrder = await orderRepository.save(order);

    // Publish orderlines to RabbitMQ for quantity update
    await publishToRabbit(orderlines);

    res.status(201).json(savedOrder);
  } catch (error) {
    next(error);
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

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Order handler server running at http://localhost:${PORT}`);
});

