import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

import { TicketCreatedListener } from '../src/events/ticket-created-listener';

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

// Watching for interupt or terminate signals, those signals send to
// this process, whenever ts-node-dev trys to restart our program
// or any time you hit Cntrl+C at your terminal

// *** This might not work correct on Windows ***
// interupt signal
process.on('SIGINT', () => stan.close()); // close client
// terminate signal
process.on('SIGTERM', () => stan.close()); // close client