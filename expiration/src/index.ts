import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  console.log('Starting');
  // check if environment variable defined
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  // Remember we can have multiple pod's of the same 
  // service running, each of it will have unique 
  // NATS_CLIENT_ID, example: tickets-depl-fc79fbdf8-5dmc5
  try {
    // connecting to nats streaming server
    // clusterId is -cid arg in the nats-depl.yaml file
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    // listen on 'close' event
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });

    // listen on interupt & terminate signals, whenever occured
    // close NATS Streaming Server client/stan connection
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    // listen for an events
    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();

