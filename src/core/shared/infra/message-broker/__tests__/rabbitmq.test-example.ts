import { IDomainEvent } from '../../../domain/events/event.interface';
import { Uuid } from '../../../domain/value-objects/uuid.vo';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Config } from '../../config';
import { ConsumeMessage } from 'amqplib';
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

// This test will not run in the test pipeline. If you want to make it run, change its name to finish with .test.ts
describe('RabbitMQ Message Broker Integration Test', () => {
  let service: RabbitMQMessageBroker;
  let connection: AmqpConnection;

  beforeEach(async () => {
    connection = new AmqpConnection({
      uri: Config.rabbitmqUri(),
      connectionInitOptions: { wait: true },
      logger: {
        debug: () => {},
        error: () => {},
        // info: () => {},
        warn: () => {},
        log: () => {},
      },
    });

    await connection.init();
    const channel = connection.channel;

    await channel.assertExchange('test-exchange', 'direct', {
      durable: false,
    });
    await channel.assertQueue('test-queue', { durable: false });
    await channel.purgeQueue('test-queue');
    await channel.bindQueue('test-queue', 'test-exchange', 'TestEvent');

    service = new RabbitMQMessageBroker(
      connection,
      TEST_RABBITMQ_EVENTS_CONFIG,
    );
  });

  afterEach(async () => {
    try {
      await connection.managedConnection.close();
    } catch (err) {
      console.log('Error when trying to close RabbitMQ connection:', err);
    }
  });

  describe('publish', () => {
    it('should publish events to channel', async () => {
      const event = new TestEvent(new Uuid());

      await service.publishEvent(event);

      const msg: ConsumeMessage = await new Promise((resolve) => {
        connection.channel.consume('test-queue', (msg) => {
          resolve(msg);
        });
      });

      const msgContent = JSON.parse(msg.content.toString());
      expect(msgContent).toEqual({
        aggregateId: { id: event.aggregateId.id },
        eventVersion: 1,
        occurredOn: event.occurredOn.toISOString(),
      });
    });
  });
});
