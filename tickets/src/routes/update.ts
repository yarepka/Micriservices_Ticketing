import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  NotAuthorizedError,
  RequestValidationError,
  currentUser
} from '@yarepkatickets/common';

const router = express.Router();

router.put('/api/tickets/:id',
  currentUser,
  requireAuth,
  [
    body('title')
      .not()
      .isEmpty()
      .withMessage('Title is required'),

    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than zero')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      // ticket with specified id does not exists
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      // user is trying to edit the ticket he do not own
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price
    });
    await ticket.save();

    res.send(ticket);
  });

export { router as updateTicketRouter };