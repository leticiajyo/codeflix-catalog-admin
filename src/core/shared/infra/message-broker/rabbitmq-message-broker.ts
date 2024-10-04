import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { IMessageBroker } from '../../application/message-broker.interface';
import { IIntegrationEvent } from '../../domain/events/event.interface';
import { RabbitMQEventsConfig } from './rabbitmq-events-config';

export class RabbitMQMessageBroker implements IMessageBroker {
  constructor(
    private conn: AmqpConnection,
    private rabbitMQConfig: RabbitMQEventsConfig,
  ) {}

  async publishEvent(event: IIntegrationEvent): Promise<void> {
    const config = this.rabbitMQConfig[event.constructor.name];
    await this.conn.publish(config.exchange, config.routingKey, event);
  }
}
