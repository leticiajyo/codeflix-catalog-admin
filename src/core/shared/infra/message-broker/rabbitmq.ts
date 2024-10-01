import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { IMessageBroker } from '../../application/message-broker.interface';
import { IDomainEvent } from '../../domain/events/domain-event.interface';
import { RabbitMQEventsConfig } from './rabbitmq-events-config';

export class RabbitMQMessageBroker implements IMessageBroker {
  constructor(
    private conn: AmqpConnection,
    private rabbitMQConfig: RabbitMQEventsConfig,
  ) {}

  async publishEvent(event: IDomainEvent): Promise<void> {
    const config = this.rabbitMQConfig[event.constructor.name];
    await this.conn.publish(config.exchange, config.routingKey, event);
  }
}
