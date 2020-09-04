import { Message } from 'node-nats-streaming';

import { Listener } from './base-listener';
import { TicketCreatedEvent } from '../events/ticket-created-event';
import { Subjects } from '../events/subjects';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    console.log('Event data!', data);

    console.log(data.id);
    console.log(data.title);
    console.log(data.price);

    // acknowledge the message
    msg.ack();
  }
}