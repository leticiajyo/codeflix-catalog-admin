import { ChannelWrapper } from 'amqp-connection-manager';
import { IDomainEvent } from '../../../domain/events/domain-event.interface';
import { Uuid } from '../../../domain/value-objects/uuid.vo';
import { RabbitMQMessageBroker } from '../rabbitmq';
import { RabbitMQEventsConfig } from '../rabbitmq-events-config';

class TestEvent implements IDomainEvent {
  occurredOn: Date = new Date();
  eventVersion: number = 1;

  constructor(readonly aggregateId: Uuid) {}
}

export const TEST_RABBITMQ_EVENTS_CONFIG: RabbitMQEventsConfig = {
  TestEvent: {
    exchange: 'test-exchange',
    routingKey: 'TestEvent',
  },
};

describe('RabbitMQ Message Broker', () => {
  let rabbitmq: RabbitMQMessageBroker;
  let connection: ChannelWrapper;

  beforeEach(async () => {
    connection = {
      publish: jest.fn(),
    } as any;
    rabbitmq = new RabbitMQMessageBroker(
      connection as any,
      TEST_RABBITMQ_EVENTS_CONFIG,
    );
  });

  describe('publish', () => {
    it('should publish events to channel', async () => {
      const event = new TestEvent(new Uuid());

      await rabbitmq.publishEvent(event);

      expect(connection.publish).toHaveBeenCalledWith(
        TEST_RABBITMQ_EVENTS_CONFIG[TestEvent.name].exchange,
        TEST_RABBITMQ_EVENTS_CONFIG[TestEvent.name].routingKey,
        event,
      );
    });
  });
});
