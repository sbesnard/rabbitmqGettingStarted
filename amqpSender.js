require('dotenv').config()
const amqplib = require('amqplib');

(async () => {
  if (!process.env.RABBITMQ_HOST) {
    throw Error('You should first fill the .env-example file and rename it to .env');
  }

  const message = 'It\'s ' + Date();


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

    topic = "amq.topic";
  const channel = await connection.createChannel();
  

  await channel.publish(topic,'groups.aaa', Buffer.from(message), {});
  console.log(`Sent message "${message}" to topic ${topic}`);

  await channel.close();
  await connection.close();

})().catch(error => {
  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});