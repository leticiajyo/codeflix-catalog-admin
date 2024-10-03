import { IDomainEvent } from '../domain/events/event.interface';

export interface IMessageBroker {
  publishEvent(event: IDomainEvent): Promise<void>;
}
