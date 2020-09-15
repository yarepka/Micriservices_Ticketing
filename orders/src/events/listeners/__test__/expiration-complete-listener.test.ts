import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderStatus, ExpirationCompleteEvent } from '@yarepkatickets/common';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

const setup = async () => {
  // Create listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // Create & Save Ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  // Create & Save Order
  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'alsfk',
    expiresAt: new Date(),
    ticket
  });
  await order.save();
  
  // Create event data
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  };

  // Create message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, order, data, msg };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // get second argument passed to the 
  // client.publish(subject, JSON.stringify(data)) function
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});