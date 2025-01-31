require('dotenv').config()
const amqplib = require('amqplib');

(async () => {
  if (!process.env.RABBITMQ_HOST) {
    throw Error('You should first fill the .env-example file and rename it to .env');
  }

  const queue = 'actions';

  const connection = await amqplib.connect(
    {
      protocol: 'amqps',
      hostname: process.env.RABBITMQ_HOST,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD
    }
  );
  console.log('Connected');
  process.once('SIGTERM', () => connection.close());

  const channel = await connection.createChannel();

  console.log('Waiting for messages... You can send one by running `node amqpSender.js in an other terminal.`');
  channel.bindQueue(queue, 'amq.topic', '*');
  await channel.prefetch(1);
  
  channel.consume(
    queue,
    async message => {
      console.log(`Received on queue ${queue}: ${message.content.toString()}`);
      await sleep(5000);

      channel.ack(message)},
    { noAck: false},
    (err, res) => console.log({ err, res })
  );

})().catch(error => {
  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}