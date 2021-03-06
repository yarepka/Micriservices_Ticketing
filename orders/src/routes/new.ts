import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@yarepkatickets/common';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

// Create an order to purchase the specified ticket
router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      // we assume that the id is type of ObjectId, it means we use
      // mongoDb as a db, but what if we change the db to let's say
      // MySQL, then we will have the different id structure. 
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure that this ticket is not already reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(
      expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS
    );

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket
    });
    await order.save();

    // Publish an event saying that an order was created
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      version: order.version,
      expiresAt: order.expiresAt.toISOString(), // UTS timestamp
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    });

    res.status(201).send(order);
  });

export { router as newOrderRouter };