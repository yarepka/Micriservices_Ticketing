import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
// Mocked/Fake nats wrapper
import { natsWrapper } from '../../nats-wrapper';

it('return an error if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  // creating ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20
  });
  await ticket.save();

  // creating order and associate it with the ticket above
  const order = Order.build({
    userId: 'lgksdlfgklsd',
    ticket: ticket,
    status: OrderStatus.Created,
    expiresAt: new Date()
  });

  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    title: 'conert',
    price: 20
  });

  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  const orders = await Order.find({});
  expect(orders).toHaveLength(1);
});

it('emits an order created event', async () => {
  const ticket = Ticket.build({
    title: 'conert',
    price: 20
  });

  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
