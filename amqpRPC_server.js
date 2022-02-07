require('dotenv').config()
const amqplib = require('amqplib');


/**
 * EXEMPLE SERVEUR RPC dans RABBITMQ
 * Cet exemple est adapté à une réponse qui va être consommé par un client sous protocole MQTT
 */
(async () => {
  if (!process.env.RABBITMQ_HOST) {
    throw Error('You should first fill the .env-example file and rename it to .env');
  }

  const queueName = 'rpc'; // queue qui reçoit les requêtes et à laquelle les workers s'abonnent.

  const connection = await amqplib.connect(
    {
      protocol: 'amqps',
      hostname: process.env.RABBITMQ_HOST,
      username: process.env.RABBITMQ_DEV_PUBLISHER_USERNAME,
      password: process.env.RABBITMQ_DEV_PUBLISHER_PASSWORD,
      vhost: 'dev'
    }
  );
  console.log('Connected');
  process.once('SIGTERM', () => connection.close());

  const channel = await connection.createChannel();

  console.log('Waiting for messages... You can send one by running `node amqpSender.js in an other terminal.`');
  channel.bindQueue(queueName, 'amq.topic', 'rpcc/*'); // les messages qui arrivent de mqtt sont TOUS dirigés
  await channel.prefetch(1);
  
  channel.consume(
    queueName,
    async message => {
      console.log(message.properties);
      console.log(`Received on queue ${queueName}: ${message.content.toString()}`);
      
   let reply = JSON.parse(message.content.toString());
   reply['answer']="World!";
   
      const correlation_id = reply['correlation_id'] || "?";
// test if different ID is caught
      // channel.publish('amq.topic','rpc_answer.'+id+"aaa", Buffer.from(JSON.stringify(reply)), {qos:0});
      //console.log(`Sent message "${JSON.stringify(reply)}" to topic ${id}-AAA`);

  
 
    
   channel.publish('amq.topic','rpc_answer.'+correlation_id, Buffer.from(JSON.stringify(reply)), {qos:0});
  console.log(`Sent message "${JSON.stringify(reply)}" to topic ${correlation_id}`);

  channel.ack(message)
 

      },
    { noAck: false},
    (err, res) => console.log({ err, res })
  );

})().catch(error => {
  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});

async function sleep(milliseconds) {
  console.log(`START WAIT ${milliseconds}--------`)
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
  console.log("END WAIT --------")
}