import { Publisher, Subjects, TicketUpdatedEvent } from '@yarepkatickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
