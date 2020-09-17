import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queue-group-name';
import { Listener, OrderCancelledEvent, Subjects, OrderStatus } from '@yarepkatickets/common';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findOne({
      // assume that in the future we might have 'order:updated'
      // event, that's why we are including version in the query
      _id: data.id,
      version: data.version - 1
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    msg.ack();
  }
}