require('dotenv').config()
const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');

/** EXEMPLE RPC
 * Cet exemple permet d'envoyer en MQTT une requête et d'attendre le résultat sur un autre topic
 * dans une topic dédié de la queue amq.topic appelée rpc_answer/$correlation_id
 * le correlation_id est un identifiant de tâche qui permet au client de créer un topic dédié
 * pour la réponse
*/

const correlation_id =uuidv4();
if (!process.env.RABBITMQ_HOST) {
  throw Error('You should first fill the .env-example file and rename it to .env');
}

const client = mqtt.connect(`mqtts://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:1884`);
const topic = 'rpc';

// Publish a message when the client connects
client.on(
  'connect',
  async () => {
    process.once('SIGTERM', () => client.end());
  
    await main();
    
  }
);

client.on(
  'message',
  (my_topic, message)=> {
    console.log(`Received on topic ${my_topic}: ${message.toString()}`);

    var response = JSON.parse(message.toString());

    const regex = /^rpc_answer\/([\w\-\d]+)/gm;
    const m = [...my_topic.matchAll(regex)];

    if (m  !== null) {
        
        if (m.length>0){
        
          matches = [...m[0]];
          if (matches.length>1){
             var response_id = matches[1].toString();
            console.log(`Found match : ${response_id}`);
            console.log(`compare match to : ${correlation_id}`);
          
              if (response_id == correlation_id){
                console.log(`Response to request : ${message.toString()}`);
                 client.unsubscribe(m[0][0])
              }            
           }      
        }
      close()
    }
  });


  async function close(){
    await client.end();
    process.exit(0);

  }
async function main(){
 
 const message = {text:"Hello", 'correlation_id': correlation_id};
 client.subscribe("rpc_answer/"+correlation_id);
 client.publish(topic, JSON.stringify(message));




}