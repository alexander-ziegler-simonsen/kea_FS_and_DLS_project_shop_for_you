import amqp from 'amqplib';
import fs from 'fs';
import path from 'path';
import http from 'http';

// Minimal HTTP server for Render
const PORT = process.env.ORDER_PORT || 10232;
http.createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Order consumer is running.\n');
}).listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// Only set up logging if not in production
let logToFile = (_: string) => {};
if (process.env.NODE_ENV !== 'production') {
  const LOG_DIR = path.join(__dirname, 'logs');
  const LOG_FILE = path.join(LOG_DIR, 'order-consumer.log');

  // Ensure the log directory exists
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  logToFile = function(message: string) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
  };
}

async function connectRabbitMQ() {
  function getRabbitUrl() {
    const isProd = process.env.NODE_ENV === 'production';
    const protocol = isProd ? 'amqps' : 'amqp';
    const vhost = process.env.RABBIT_VHOST;
    const vhostPart = vhost ? `/${encodeURIComponent(vhost)}` : '';
    return `${protocol}://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}${vhostPart}`;
  }

  const RABBITMQ_URL = getRabbitUrl();
  const QUEUE_NAME = 'order-queue';

  try {
    console.log(`Connecting to RabbitMQ at ${RABBITMQ_URL}...`);
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`✅ Listening for messages on queue: ${QUEUE_NAME}`);

    channel.consume(
      QUEUE_NAME,
      async (msg: amqp.ConsumeMessage | null) => {
        if (msg) {
          const messageContent = msg.content.toString();
          console.log('📦 Received message:', messageContent);

          // Process the message
          processOrderMessage(JSON.parse(messageContent));

          // Acknowledge the message
          channel.ack(msg);

          // Wait 30 seconds before processing the next message
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      },
      { noAck: false }
    );

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('🔌 Closing RabbitMQ connection...');
      await connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error);
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