require('dotenv').config()
const mqtt = require('mqtt');

(async () => {
  if (!process.env.RABBITMQ_HOST) {
    throw Error('You should first fill the .env-example file and rename it to .env');
  }

  const client = mqtt.connect(`mqtts://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:1884`);
  const topic = 'rpc';

  // On connect
  client.on(
    'connect',
    () => {
      process.once('SIGTERM', () => client.end());
      console.log('Connected');
      client.subscribe(topic);
      console.log('Waiting for messages... You can send one by running `node mqttSender.js in an other terminal.`');
    }
  );

  // On message received
  client.on(
    'message',
    (topic, message) => {
      
      console.log(`Received on topic ${topic}: ${message.toString()}`);
      
      
   let reply = JSON.parse(message.toString());
   reply['answer']="World!";
   
      const correlation_id = reply['correlation_id'] || "?";
// test if different ID is caught
      // channel.publish('amq.topic','rpc_answer.'+id+"aaa", Buffer.from(JSON.stringify(reply)), {qos:0});
      //console.log(`Sent message "${JSON.stringify(reply)}" to topic ${id}-AAA`);

  
 
    
  console.log(`Sent message "${JSON.stringify(reply)}" to topic ${correlation_id}`);

  

  client.ack(message);
      const reply_topic = rpc_answer+'/'+correlation_id;

      client.publish(reply_topic, JSON.stringify(reply));
    }
  );

})().catch(error => {
  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});