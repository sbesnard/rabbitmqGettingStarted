require('dotenv').config()
const mqtt = require('mqtt');

(async () => {
  if (!process.env.RABBITMQ_HOST) {
    throw Error('You should first fill the .env-example file and rename it to .env');
  }

  const client = mqtt.connect(`mqtts://${process.env.MQTT_USER}:${process.env.MQTT_PASSWORD}@${process.env.MQTT_SERVER_URL}:${process.env.MQTT_PORT}`);
  const topic = 'dev/groups/+';

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
    (topic, message) => console.log(`Received on topic ${topic}: ${message.toString()}`)
  );

})().catch(error => {
  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});