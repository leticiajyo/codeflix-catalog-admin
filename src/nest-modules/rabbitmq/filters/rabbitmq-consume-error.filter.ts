import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConsumeMessage, MessagePropertyHeaders } from 'amqplib';

@Catch()
export class RabbitmqConsumeErrorFilter implements ExceptionFilter {
  readonly RETRY_COUNT_HEADER = 'x-retry-count';
  readonly MAX_RETRIES = 3;

  readonly NON_RETRIABLE_ERRORS = [
    NotFoundError,
    EntityValidationError,
    UnprocessableEntityException,
  ];

  constructor(private amqpConnection: AmqpConnection) {}

  async catch(exception: Error, host: ArgumentsHost) {
    if (host.getType<'rmq'>() !== 'rmq') {
      return;
    }

    const hasNonRetriableError = this.NON_RETRIABLE_ERRORS.some(
      (error) => exception instanceof error,
    );

    if (hasNonRetriableError) {
      return new Nack(false);
    }

    const ctx = host.switchToRpc();
    const message: ConsumeMessage = ctx.getContext();

    if (this.shouldRetry(message.properties.headers)) {
      await this.retry(message);
    } else {
      return new Nack(false);
    }
  }

  private shouldRetry(messageHeaders: MessagePropertyHeaders): boolean {
    const retryHeader = this.RETRY_COUNT_HEADER;
    const maxRetries = this.MAX_RETRIES;

    return (
      !(retryHeader in messageHeaders) ||
      messageHeaders[retryHeader] < maxRetries
    );
  }

  private async retry(message: ConsumeMessage) {
    const messageHeaders = message.properties.headers;
    const retryHeader = this.RETRY_COUNT_HEADER;

    messageHeaders[retryHeader] = messageHeaders[retryHeader]
      ? messageHeaders[retryHeader] + 1
      : 1;
    messageHeaders['x-delay'] = 5000; // 5s

    return this.amqpConnection.publish(
      'direct.delayed',
      message.fields.routingKey,
      message.content,
      {
        correlationId: message.properties.correlationId,
        headers: messageHeaders,
      },
    );
  }
}
