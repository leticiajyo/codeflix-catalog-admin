import { ArgumentsHost } from '@nestjs/common';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';
import { RabbitmqConsumeErrorFilter } from '../rabbitmq-consume-error.filter';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';

describe('RabbitMQ Consume Error Filter', () => {
  let filter: RabbitmqConsumeErrorFilter;
  let connection: AmqpConnection;

  beforeEach(async () => {
    connection = {
      publish: jest.fn(),
    } as any;
    filter = new RabbitmqConsumeErrorFilter(connection);
  });

  describe('catch', () => {
    it('should not retry if error is non-retriable', async () => {
      const host = {
        getType: jest.fn().mockReturnValue('rmq'),
        switchToRpc: jest.fn(),
      } as unknown as ArgumentsHost;

      const error = new EntityValidationError([
        {
          key: ['value'],
        },
      ]);

      const result = await filter.catch(error, host);

      expect(host.getType).toHaveBeenCalled();
      expect(result).toEqual(new Nack(false));
      expect(host.switchToRpc).not.toHaveBeenCalled();
    });

    it('should retry if error is retriable and retry count is less than max retries', async () => {
      const host = {
        getType: jest.fn().mockReturnValue('rmq'),
        switchToRpc: jest.fn().mockReturnValue({
          getContext: jest.fn().mockReturnValue({
            properties: { headers: { 'x-retry-count': 1 } },
            fields: { routingKey: 'test' },
            content: Buffer.from('test'),
          }),
        }),
      } as unknown as ArgumentsHost;

      await filter.catch(new Error(), host);

      expect(host.getType).toHaveBeenCalled();
      expect(connection.publish).toHaveBeenCalledWith(
        'direct.delayed',
        'test',
        Buffer.from('test'),
        {
          correlationId: undefined,
          headers: {
            'x-retry-count': 2,
            'x-delay': 5000,
          },
        },
      );
    });

    it('should not retry if error is retriable and retry count is greater or equal than max retries', async () => {
      const host = {
        getType: jest.fn().mockReturnValue('rmq'),
        switchToRpc: jest.fn().mockReturnValue({
          getContext: jest.fn().mockReturnValue({
            properties: { headers: { 'x-retry-count': 3 } },
          }),
        }),
      } as unknown as ArgumentsHost;

      const retrySpy = jest.spyOn(filter, 'retry' as any);

      const result = await filter.catch(new Error(), host);

      expect(host.switchToRpc).toHaveBeenCalled();
      expect(retrySpy).not.toHaveBeenCalled();
      expect(result).toEqual(new Nack(false));
    });
  });
});
