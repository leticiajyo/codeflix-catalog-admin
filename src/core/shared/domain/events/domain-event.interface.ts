import { Uuid } from '../value-objects/uuid.vo';

export interface IDomainEvent {
  aggregateId: Uuid;
  occurredOn: Date;
  eventVersion: number;
}
