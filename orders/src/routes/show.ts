import express, { Request, Response } from 'express';

import { requireAuth, NotFoundError, NotAuthorizedError } from '@yarepkatickets/common';
import { Order } from '../models/order';

const router = express.Router();

// Get details about a specific order by orderId for logged in user
router.get('/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');

    // no order with specified id
    if (!order) {
      throw new NotFoundError();
    }

    // logged in user do not own the specified order
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  });

export { router as showOrderRouter };