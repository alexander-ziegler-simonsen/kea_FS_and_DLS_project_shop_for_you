import 'dotenv/config';
import amqp from 'amqplib';
import { AppDataSource } from './data-source.js';
import { Order } from './entities/Order.js';

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function connectRabbit(retries = 5) {
  const url = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;

  for (let i = 0; i < retries; i++) {
    try {
      const connection = await amqp.connect(url);
      console.log('✅ Connected to RabbitMQ');
      return connection;
    } catch (err: any) { // Explicitly type 'err' as 'any'
      console.log(`❌ RabbitMQ connection failed. Retry ${i + 1}/${retries}:`, err.message);
      await sleep(3000);
    }
  }
  throw new Error('💥 Failed to connect to RabbitMQ after retries.');
}

async function startConsumer() {
  const conn = await connectRabbit();
  const channel = await conn.createChannel();
  await channel.assertExchange('order-exchange', 'topic', { durable: false });

  const qCreated = await channel.assertQueue('', { exclusive: true });
  channel.bindQueue(qCreated.queue, 'order-exchange', 'order.created');

  const qUpdated = await channel.assertQueue('', { exclusive: true });
  channel.bindQueue(qUpdated.queue, 'order-exchange', 'order.updated');

  const qDeleted = await channel.assertQueue('', { exclusive: true });
  channel.bindQueue(qDeleted.queue, 'order-exchange', 'order.deleted');

  // Consumer for created orders
  channel.consume(qCreated.queue, async (msg) => {
    if (msg) {
      try {
        const orderData = JSON.parse(msg.content.toString());
        const orderRepository = AppDataSource.getRepository(Order);

        const order = orderRepository.create(orderData as Order); // Explicitly cast orderData to Order
        await orderRepository.save(order);

        console.log(`✅ Order created: ${order.id}`);
        channel.ack(msg);
      } catch (error: any) { // Explicitly type 'error' as 'any'
        console.error('❌ Failed to process created order:', error.message);
        channel.nack(msg);
      }
    }
  });

  // Consumer for updated orders
  channel.consume(qUpdated.queue, async (msg) => {
    if (msg) {
      try {
        const orderData = JSON.parse(msg.content.toString());
        const orderRepository = AppDataSource.getRepository(Order);

        const existingOrder = await orderRepository.findOneBy({ id: orderData.id });
        if (existingOrder) {
          Object.assign(existingOrder, orderData);
          await orderRepository.save(existingOrder);
          console.log(`✏️ Order updated: ${existingOrder.id}`);
        } else {
          console.warn(`⚠️ Order with ID ${orderData.id} not found for update.`);
        }

        channel.ack(msg);
      } catch (error: any) { // Explicitly type 'error' as 'any'
        console.error('❌ Failed to process updated order:', error.message);
        channel.nack(msg);
      }
    }
  });

  // Consumer for deleted orders
  channel.consume(qDeleted.queue, async (msg) => {
    if (msg) {
      try {
        const { id } = JSON.parse(msg.content.toString());
        const orderRepository = AppDataSource.getRepository(Order);

        const result = await orderRepository.delete({ id });
        if (result.affected) {
          console.log(`🗑️ Order deleted: ${id}`);
        } else {
          console.warn(`⚠️ Order with ID ${id} not found for deletion.`);
        }

        channel.ack(msg);
      } catch (error: any) { // Explicitly type 'error' as 'any'
        console.error('❌ Failed to process deleted order:', error.message);
        channel.nack(msg);
      }
    }
  });

  console.log('🚀 Order handler consumer is now listening for order.created, order.updated, and order.deleted messages...');
}

startConsumer().catch((err) => {
  console.error('💥 Consumer failed to start:', err.message);
});
