import { OrderCancelledEvent, OrderStatus } from '@yarepkatickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';

const setup = async () => {
  // Create and save Order
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'userId123',
    price: 25,
    status: OrderStatus.Created
  });

  await order.save();

  // Create listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create event data
  const data: OrderCancelledEvent['data'] = {
    id: order._id,
    version: 1,
    ticket: {
      id: 'ticketId123'
    }
  };

  // Create msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { order, listener, data, msg };
};

it('updates the status of the order', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});