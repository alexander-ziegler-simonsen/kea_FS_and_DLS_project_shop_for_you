import amqp from 'amqplib';
import fs from 'fs';
import path from 'path';

const RABBITMQ_URL = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;
const QUEUE_NAME = 'order-queue';

const LOG_DIR = '/var/log/order-consumer';
const LOG_FILE = path.join(LOG_DIR, 'order-consumer.log');

// Ensure the log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

async function connectRabbitMQ() {
  try {
    console.log('Connecting to RabbitMQ...');
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`Listening for messages on queue: ${QUEUE_NAME}`);

    channel.consume(
      QUEUE_NAME,
      (msg) => {
        if (msg) {
          const messageContent = msg.content.toString();
          console.log('Received message:', messageContent);

          // Process the message (e.g., log or perform operations)
          processOrderMessage(JSON.parse(messageContent));

          // Acknowledge the message
          channel.ack(msg);
        }
      },
      { noAck: false }
    );

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Closing RabbitMQ connection...');
      await connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    setTimeout(connectRabbitMQ, 5000); // Retry after 5 seconds
  }
}

function processOrderMessage(message: any) {
  console.log('Processing order:', message);
  logToFile(`Processing order: ${JSON.stringify(message)}`);

  // Add your logic here (e.g., update inventory, notify services, etc.)
}

// Start the consumer
connectRabbitMQ();