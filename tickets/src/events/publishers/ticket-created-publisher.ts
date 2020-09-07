import { Publisher, Subjects, TicketCreatedEvent } from '@yarepkatickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}

