import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { RABBITMQ_EVENTS_CONFIG } from '@core/shared/infra/message-broker/rabbitmq-events-config';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { AudioVideoMediaUploadedIntegrationEvent } from '@core/video/domain/events/audio-video-media-replaced.event';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { createVideoRelations } from '@core/video/infra/db/sequelize/testing/video-sequelize.helper';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { getConnectionToken } from '@nestjs/sequelize';
import { TestingModule, Test } from '@nestjs/testing';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { Sequelize } from 'sequelize';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';
import { ConfigModule } from 'src/nest-modules/config/config.module';
import { DatabaseModule } from 'src/nest-modules/database/database.module';
import { EventModule } from 'src/nest-modules/event/event.module';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres/genres.providers';
import { RabbitmqModule } from 'src/nest-modules/rabbitmq/rabbitmq.module';
import { StorageModule } from 'src/nest-modules/storage/storage.module';
import { UseCaseModule } from 'src/nest-modules/use-case/use-case.module';
import { VideosModule } from 'src/nest-modules/videos/videos.module';
import { VIDEOS_PROVIDERS } from 'src/nest-modules/videos/videos.providers';

describe('Publish Video Media Replaced In Queue Handler ', () => {
  let module: TestingModule;
  let channelWrapper: ChannelWrapper;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        StorageModule,
        EventModule,
        UseCaseModule,
        RabbitmqModule.forRoot(),
        VideosModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      .compile();
    await module.init();

    const amqpConn = module.get<AmqpConnection>(AmqpConnection);
    channelWrapper = amqpConn.managedConnection.createChannel();
    await channelWrapper.addSetup((channel) => {
      return Promise.all([
        channel.assertQueue('test-queue-video-upload', {
          durable: false,
        }),
        channel.bindQueue(
          'test-queue-video-upload',
          RABBITMQ_EVENTS_CONFIG[AudioVideoMediaUploadedIntegrationEvent.name]
            .exchange,
          RABBITMQ_EVENTS_CONFIG[AudioVideoMediaUploadedIntegrationEvent.name]
            .routingKey,
        ),
      ]).then(() => channel.purgeQueue('test-queue-video-upload'));
    });
  });

  afterEach(async () => {
    await channelWrapper.close();
    await module.close();
  });

  it('should publish video media replaced event in queue', async () => {
    const categoryRepo: CategorySequelizeRepository = module.get(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
    const genreRepo: GenreSequelizeRepository = module.get(
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    const castMemberRepo: CastMemberSequelizeRepository = module.get(
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
    const videoRepo: IVideoRepository = module.get(
      VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
    );

    const { category, genre, castMember } = await createVideoRelations(
      categoryRepo,
      genreRepo,
      castMemberRepo,
    );

    const videoFake = Video.fake().oneVideoWithoutMedias().build();
    const video = Video.create({
      ...videoFake,
      categoryIds: [new CategoryId(category.categoryId.id)],
      genreIds: [new GenreId(genre.genreId.id)],
      castMemberIds: [new CastMemberId(castMember.castMemberId.id)],
    });
    await videoRepo.insert(video);

    const useCase: UploadAudioVideoMediasUseCase = module.get(
      VIDEOS_PROVIDERS.USE_CASES.UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE.provide,
    );

    await useCase.execute({
      videoId: video.videoId.id,
      field: 'video',
      file: {
        data: Buffer.from('data'),
        mimeType: 'video/mp4',
        rawName: 'video.mp4',
        size: 100,
      },
    });

    const msg: ConsumeMessage = await new Promise((resolve) => {
      channelWrapper.consume('test-queue-video-upload', (msg) => {
        resolve(msg);
      });
    });

    const msgObj = JSON.parse(msg.content.toString());
    const updatedVideo = await videoRepo.findById(video.videoId);
    expect(msgObj.payload).toEqual({
      resourceId: `${video.videoId.id}.video`,
      filePath: updatedVideo?.video?.rawUrl,
    });
  });
});
