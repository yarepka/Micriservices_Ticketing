import express, { Request, Response, response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({
    orderId: undefined // find tickets which are not reserved
  });

  res.send(tickets);
});

export { router as indexTicketRouter };