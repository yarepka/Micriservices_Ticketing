import { Stan } from 'node-nats-streaming';
import { Subjects } from '../events/subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  // Name of the channel this publisher is going to publish to
  // e.g ticket:created
  abstract subject: T['subject'];

  // Pre-initialized NATS client
  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  // Publish message/event
  publish(data: T['data']): Promise<void> {
    // we return promise because there could be situations where we'll need
    // to wait untill message published and do something after that, remeber
    // that publishing/emitting event is async operation
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }

        console.log('Event published to subject', this.subject);
        resolve();
      });
    });
  }
}