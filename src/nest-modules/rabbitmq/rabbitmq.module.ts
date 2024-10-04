import { RABBITMQ_EVENTS_CONFIG } from '@core/shared/infra/message-broker/rabbitmq-events-config';
import { RabbitMQMessageBroker } from '@core/shared/infra/message-broker/rabbitmq-message-broker';
import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/*
It's possible to use the @Module() decorator to inject RabbitMQ, but then everything would have to be global. 
If we want to instantiate the broker separately by module, or only add it in the necessary modules, an option 
is to divide the Rabbitmq module registration in forRoot() and forFeature().
*/

// @Global
// @Module({
//   imports: [
//     RabbitMQModule.forRootAsync(RabbitMQModule, {
//       useFactory: (configService: ConfigService) => ({
//         uri: configService.get('RABBITMQ_URI') as string,
//       }),
//       inject: [ConfigService],
//     }),
//   ],
//   providers: [
//     {
//       provide: 'IMessageBroker',
//       useFactory: (amqpConnection: AmqpConnection) => {
//         return new RabbitMQMessageBroker(amqpConnection);
//       },
//       inject: [AmqpConnection],
//     },
//   ],
//   exports: ['IMessageBroker'],
// })

// RabbitmqModule should have a different name than the module from the lib (RabbitMQModule)
export class RabbitmqModule {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModule,
      imports: [
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useFactory: (configService: ConfigService) => ({
            uri: configService.get('RABBITMQ_URI') as string,
          }),
          inject: [ConfigService],
        }),
      ],
      global: true,
      exports: [RabbitMQModule],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: 'IMessageBroker',
          useFactory: (amqpConnection: AmqpConnection) => {
            return new RabbitMQMessageBroker(
              amqpConnection,
              RABBITMQ_EVENTS_CONFIG,
            );
          },
          inject: [AmqpConnection],
        },
      ],
      exports: ['IMessageBroker'],
    };
  }
}
