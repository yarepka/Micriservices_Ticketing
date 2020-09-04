import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from '../events/subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  // Name of the channel this listener is going to listen to
  // e.g ticket:created
  abstract subject: T['subject'];
  // Function to run when a message is received
  abstract onMessage(data: T['data'], msg: Message): void;
  // Pre-initialized NATS client
  private client: Stan;
  // Name of the queue group & 
  abstract queueGroupName: string;
  // Number of milliseconds this listener has to acknowledge a message
  protected ackWait = 5 * 1000;

  constructor(client: Stan) { this.client = client; }

  // Default subscription options
  subscribtionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  // Code to set up the subscription
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscribtionOptions()
    );

    subscription.on('message', (msg: Message) => {
      console.log(
        `Message received: ${this.subject} / ${this.queueGroupName}`
      );

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    })
  }

  // Helper function to parse a message
  parseMessage(msg: Message) {
    const data = msg.getData();

    return typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf8'));
  }
}