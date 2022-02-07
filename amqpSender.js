require('dotenv').config()
const amqplib = require('amqplib');

(async () => {
  if (!process.env.RABBITMQ_HOST) {
    throw Error('You should first fill the .env-example file and rename it to .env');
  }

  const message = '{"type":"USER"}';


  const connection = await amqplib.connect(
    {
      protocol: 'amqps',
      hostname: process.env.RABBITMQ_HOST,
      username: process.env.RABBITMQ_DEV_PUBLISHER_USERNAME,
      password: process.env.RABBITMQ_DEV_PUBLISHER_PASSWORD,
      vhost: "dev"
    }
  );
  console.log('Connected');
  process.once('SIGTERM', () => connection.close());

  const queue = "amq.topic"; // queue permettant d'envoyer des messages vers le pont MQTT
  const topic = "groups.aaa"; // Dans AMQP, le séparateur est '.'. Cela se traduit en MQTT par un '/'
  
  const channel = await connection.createChannel();
  

  await channel.publish(queue,topic, Buffer.from(message), {});
  console.log(`Sent message "${message}" to topic ${topic}`);

  await channel.close();
  await connection.close();

})().catch(error => {
  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});