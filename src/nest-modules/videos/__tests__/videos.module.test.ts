import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import EventEmitter2 from 'eventemitter2';
import { DatabaseModule } from 'src/nest-modules/database/database.module';
import { EventModule } from 'src/nest-modules/event/event.module';
import { UseCaseModule } from 'src/nest-modules/use-case/use-case.module';
import { VideosModule } from '../videos.module';
import { AudioVideoMediaUploadedIntegrationEvent } from '@core/video/domain/events/audio-video-media-replaced.event';
import { ConfigModule } from 'src/nest-modules/config/config.module';
import { StorageModule } from 'src/nest-modules/storage/storage.module';
import { AuthModule } from 'src/nest-modules/auth/auth.module';

class RabbitmqModuleFake {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModuleFake,
      global: true,
      providers: [
        {
          provide: AmqpConnection,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
      exports: [AmqpConnection],
    };
  }
}

describe('Videos Module', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        StorageModule,
        EventModule,
        UseCaseModule,
        RabbitmqModuleFake.forRoot(),
        AuthModule,
        VideosModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: () => {
          return new UnitOfWorkFakeInMemory();
        },
      })
      .compile();

    await module.init();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should register handlers', async () => {
    const eventemitter2 = module.get<EventEmitter2>(EventEmitter2);

    expect(
      eventemitter2.listeners(AudioVideoMediaUploadedIntegrationEvent.name),
    ).toHaveLength(1);
  });
});
