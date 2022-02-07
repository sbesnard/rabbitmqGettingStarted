require('dotenv').config()
const mqtt = require('mqtt');

if (!process.env.RABBITMQ_HOST) {
  throw Error('You should first fill the .env-example file and rename it to .env');
}

const client = mqtt.connect(`mqtts://${process.env.MQTT_USER}:${process.env.MQTT_PASSWORD}@${process.env.MQTT_SERVER_URL}:${process.env.MQTT_PORT}`);
  const topic = 'dev/actions';

// Publish a message when the client connects
client.on(
  'connect',
  () => {
    process.once('SIGTERM', () => client.end());
    const message = JSON.stringify({'date' : Date()});
    client.publish(topic, message);
    console.log(`Sent message "${message}" to topic ${topic}`);
    client.end();
  }
);
