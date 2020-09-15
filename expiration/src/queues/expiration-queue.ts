import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

// What information job object will contain
// job.data.orderId
interface Payload {
  orderId: string;
};

// Create a new instance of the Queue
// 1st arg - Name of the Channel/Name
const expirationQueue = new Queue<Payload>('order:expiration', {
  // tell bull to use redis to store jobs
  redis: {
    host: process.env.REDIS_HOST
  }
});

/*
  *******************************************************************
  We want to have a delay of 15 minutes between adding the Job to the
  Queue and processing it. We do it through the options object, which
  is passed as a second argument to the Queue add function
  *******************************************************************
*/

// How job should be processed when recieved
expirationQueue.process(async (job) => {
  // publish expiration:complete event
  await new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId
  });
});

export { expirationQueue };