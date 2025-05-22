import amqp from 'amqplib';
import http from 'http';

// Minimal HTTP server for Render
const PORT = process.env.ORDER_PORT;
http.createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Order consumer is running.\n');
}).listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});



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
      (msg) => {
        if (msg) {
          const messageContent = msg.content.toString();
          console.log('📦 Received message:', messageContent);

          // Process the message
          processOrderMessage(JSON.parse(messageContent));

          // Acknowledge the message
          channel.ack(msg);
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
  // Example: Log the order details
  console.log('Processing order:', message);

  // Add your logic here (e.g., update inventory, notify services, etc.)
}

// Start the consumer
connectRabbitMQ();