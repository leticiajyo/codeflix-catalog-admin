import { Uuid } from '../value-objects/uuid.vo';

export interface IDomainEvent {
  aggregateId: Uuid;
  occurredOn: Date;
  eventVersion: number;

  getIntegrationEvent?(): IIntegrationEvent;
}

export interface IIntegrationEvent<T = any> {
  occurredOn: Date;
  eventVersion: number;
  eventName: string;
  payload: T;
}
