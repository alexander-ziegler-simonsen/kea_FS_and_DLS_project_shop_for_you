import amqp from 'amqplib';

const RABBITMQ_URL = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;
const QUEUE_NAME = 'order-queue';

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
  // Example: Log the order details
  console.log('Processing order:', message);

  // Add your logic here (e.g., update inventory, notify services, etc.)
}

// Start the consumer
connectRabbitMQ();