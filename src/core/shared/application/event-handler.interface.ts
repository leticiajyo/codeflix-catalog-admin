import {
  IDomainEvent,
  IIntegrationEvent,
} from '../domain/events/event.interface';

export interface IDomainEventHandler {
  handle(event: IDomainEvent): Promise<void>;
}

export interface IIntegrationEventHandler {
  handle(event: IIntegrationEvent): Promise<void>;
}
