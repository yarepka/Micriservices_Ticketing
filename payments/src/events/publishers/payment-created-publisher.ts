import { Publisher, PaymentCreatedEvent, Subjects } from '@yarepkatickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}