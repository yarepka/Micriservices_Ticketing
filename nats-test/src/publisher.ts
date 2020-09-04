// Publisher - Creates event/messages
import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher'

// client = stan
// we use this client to connect to NATS streaming server,
// so we can communicate with it
const stan = nats.connect('ticketing', 'abs', {
  // NATS Streaming server url
  url: 'http://localhost:4222'
});

// wait until stan/client connect to NATS streaming server
// we can't use async/await syntax, instead we use event-driven approch
// second argument function will be executed after client successfully
// connected to NATS streaming server
stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const publisher = new TicketCreatedPublisher(stan);
  // remember that publishing is async operation, what if we need 
  // to w8 for message/event to be published before going further.
  // we need something like 'await'. We solve it with returning the
  // promise from the publish() method in the Publisher abstract class
  try {
    await publisher.publish({
      id: '123',
      title: 'concert',
      price: 20
    });
  } catch (err) {
    console.error(err);
  }

});