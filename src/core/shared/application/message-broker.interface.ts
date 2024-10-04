import { IIntegrationEvent } from '../domain/events/event.interface';

export interface IMessageBroker {
  publishEvent(event: IIntegrationEvent): Promise<void>;
}
