import { Message } from 'node-nats-streaming';
import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from '@yarepkatickets/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete
    });

    // remember version will be incremented
    await order.save();

    // to addition it will be good to have 'order:updated' event 
    // publish here, but whenever Order is completed, it'll never 
    // be updated again, so that's why we do emit an event here

    msg.ack();
  }
}