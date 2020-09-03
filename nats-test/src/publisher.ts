// Publisher - Creates event/messages
import nats from 'node-nats-streaming';

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
stan.on('connect', () => {
  console.log('Publisher connected to NATS');

  // we can only share strings or row data, but data below
  // is an object, we can't share javascript object directly
  // we need to convert it into JSON first
  const data = JSON.stringify({
    id: '123',
    title: 'concert',
    price: 20
  });

  // publish event
  // information which we send is a message/event
  stan.publish('ticket:created', data, () => {
    console.log('Event published')
  });

});