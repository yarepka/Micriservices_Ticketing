import { Publisher, ExpirationCompleteEvent, Subjects } from '@yarepkatickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}