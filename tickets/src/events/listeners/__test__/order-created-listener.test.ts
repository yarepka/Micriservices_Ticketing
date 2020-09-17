import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';

import { Ticket } from '../../../models/ticket';
import { OrderCreatedEvent, OrderStatus } from '@yarepkatickets/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';

const setup = async () => {
  // Create an instance of listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = await Ticket.build({
    title: 'concert',
    price: 25,
    userId: 'userId123'
  });

  await ticket.save();

  // Create the fake event data obj
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'userId123',
    expiresAt: 'dfsgsdfh',
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };

  // Create msg obj
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn() // mock function
  };

  // Return all things
  return { listener, ticket, data, msg }

}

it('sets the userId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup();

  // listener publishes TicketUpdatedEvent inside itself
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});