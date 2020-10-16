import express, { Request, Response } from 'express';

import { requireAuth } from '@yarepkatickets/common';
import { OrderStatus } from '@yarepkatickets/common';
import { Order } from '../models/order';

const router = express.Router();

// Retrieve all active orders for the given user
// making the request
router.get('/api/orders',
  requireAuth,
  async (req: Request, res: Response) => {
    const orders = await Order.find({
      userId: req.currentUser!.id,
      status: OrderStatus.Complete
    }).populate('ticket');

    res.send(orders);
  });

export { router as indexOrderRouter };