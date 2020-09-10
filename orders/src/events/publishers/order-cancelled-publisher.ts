import { Publisher, OrderCancelledEvent, Subjects } from '@yarepkatickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}