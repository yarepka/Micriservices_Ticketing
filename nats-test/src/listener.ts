// Listener - get events/messages
import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';


// Client which connects to NATS Streaming Server, so we can
// communicate with it
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  // NATS Streaming server url
  url: 'http://localhost:4222'
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  })

  const options = stan
    .subscriptionOptions()
    // default behaviour is as soon as we got the event/message,
    // the node-nats library will turn back around to the NATS server
    // and say, 'we recieved the event, everything is good to go',
    // but if we rely on this default behaviour, if anything goes 
    // incorrectly inside of our message handler, that's it, we will
    // never hear about this event again. By setting setManualAckMode
    // to true the node-nats streaming library is no longer going to
    // automatically acknowledge or tell the nats-streaming library
    // that we've recieved an event, instead it will be up to us to
    // run some processing on the event, like save data to the database
    // and ONLY after this process is complete we will acknowledge the
    // message and say 'ok, everything has been processed successfully'
    // if we do not acknowledge the incoming event, then the NATS 
    // streaming server will w8 some amount of time (30sec) by default
    // and after 30 seconds of not getting the acknowledgment, it's 
    // goint automatically decide to take that event and send it to some
    // other member of the Queue group or if it is not the part of any
    // queue group just send it back to the same service again to have
    // another chance of processing this thing
    .setManualAckMode(true)
    /*   DURABLE SUBSRIBTIONS
      NATS Streaming Server will have DurableName subsribtions
      where for each DurableName there will be events stored
      each with processed/unprocessed status.
    */
    // will deliver all passed events ONLY for the first time we
    // bring DurableName subscription online. (will be ignored 
    // on restart)
    .setDeliverAllAvailable()
    // will save all events as processed/unprocessed, which depends on 
    // service online or offline and whenever it goes back online
    // it reconnects with the same ID and will proccess the events which
    // were marked as unproccessed
    .setDurableName('accounting-service');

  // create subscription which listen for event/subject
  // second argument is the Queue Group we want this subscription
  // to join
  const subscription = stan.subscribe(
    'ticket:created',
    // queue group name
    // even if we disconnect all clients with the same DurableName,
    // it'll not dump the entire durable subscription. Even if all
    // our different services inside this queue group goes down,
    // NATS is going to persist(save) this DurableName subscription
    // (Stores processed/unprocessed events for specified DurableName)
    'queue-group-name',
    options
  );

  subscription.on('message', (msg: Message) => {
    const data = msg.getData();

    if (typeof data === 'string') {
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    }

    // tell NATS streaming server that we recieved the message
    // and it was successfully processed
    msg.ack();
  });
});

// Watching for interupt or terminate signals, those signals send to
// this process, whenever ts-node-dev trys to restart our program
// or any time you hit Cntrl+C at your terminal

// *** This might not work correct on Windows ***
// interupt signal
process.on('SIGINT', () => stan.close()); // close client
// terminate signal
process.on('SIGTERM', () => stan.close()); // close client