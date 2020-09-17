import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { OrderStatus } from '@yarepkatickets/common';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// mocking stripe ("../../stripe" will be replaced with 
// "../../mocks/stripe")
// jest.mock('../../stripe');

// 404 - Not Found
it('returns a 404 when purchasing an order which does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: '123',
      orderId: mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

// 401 - Unathorized
it('return a 401 when purchasing an order that doesn\'t belong to the user', async () => {
  // Create an order
  const order = await Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
    price: 25,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: '123',
      orderId: order.id
    })
    .expect(401);
});

// 400 - Bad Request
it('returns 400 when purchasing a cancelled order', async () => {
  // Create a user id
  const userId = mongoose.Types.ObjectId().toHexString();

  // Create user cookie
  const user = global.signin(userId);

  // Create and save an order
  const order = await Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: userId,
    price: 25,
    status: OrderStatus.Cancelled
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', user)
    .send({
      token: '123',
      orderId: order.id
    })
    .expect(400);
});

// 201 - Created
it('returns a 201 with valid inputs', async () => {
  // Create a user id
  const userId = mongoose.Types.ObjectId().toHexString();

  // Generate the price
  const price = Math.floor((Math.random() * 100));

  // Create user cookie
  const user = global.signin(userId);

  // Create and save an order
  const order = await Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: userId,
    price: price,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', user)
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

  // Get list of 10 most recent charges
  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  // Look at the payment collection and check if it was saved or not
  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id
  });

  expect(payment).not.toBeNull();

  // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

  // expect(chargeOptions.source).toEqual('tok_visa');
  // expect(chargeOptions.amount).toEqual(25 * 100);
  // expect(chargeOptions.currency).toEqual('usd');
});