import { Message } from 'node-nats-streaming';
import { Listener, TicketUpdatedEvent, Subjects } from '@yarepkatickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  // will be in diff channels
  queueGroupName = queueGroupName;
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      // after 5 seconds of throwing an error and not calling
      // msg.ack(), NATS Streaming Server will automatically
      // re-dispatch/re-emit the event we failed to process
      throw new Error('Ticket not found');
    }

    const { title, price } = data;
    ticket.set({
      title: title,
      price: price
    });
    await ticket.save();

    msg.ack();
  }
}