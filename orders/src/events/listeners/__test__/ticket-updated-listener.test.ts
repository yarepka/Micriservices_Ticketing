import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';

import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@yarepkatickets/common';

const setup = async () => {
  // Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await ticket.save();

  // Create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new concert',
    price: 1000,
    userId: 'fasfasg'
  };

  // Create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn() // mock function
  };

  // return all of this stuff
  return { listener, data, msg, ticket };

}

it('finds, updates, and saves a ticket', async () => {
  const { ticket, msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.version).toEqual(data.version);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a future/skipped version number', async () => {
  const { msg, data, listener, ticket } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {

  }

  expect(msg.ack).not.toHaveBeenCalled();
});