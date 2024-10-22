import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ChannelWrapper } from 'amqp-connection-manager';
import { getConnectionToken, getModelToken } from '@nestjs/sequelize';
import { TestingModule, Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize';
import { ConfigModule } from 'src/nest-modules/config/config.module';
import { DatabaseModule } from 'src/nest-modules/database/database.module';
import { EventModule } from 'src/nest-modules/event/event.module';
import { RabbitmqModule } from 'src/nest-modules/rabbitmq/rabbitmq.module';
import { StorageModule } from 'src/nest-modules/storage/storage.module';
import { UseCaseModule } from 'src/nest-modules/use-case/use-case.module';
import { VideosModule } from 'src/nest-modules/videos/videos.module';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { createVideoRelations } from '@core/video/infra/db/sequelize/testing/video-sequelize.helper';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres/genres.providers';
import { VIDEOS_PROVIDERS } from 'src/nest-modules/videos/videos.providers';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import {
  AudioVideoMediaModel,
  AudioVideoMediaRelatedField,
} from '@core/video/infra/db/sequelize/audio-video-media.model';
import { AuthModule } from 'src/nest-modules/auth/auth.module';

describe('Consume video converted event ', () => {
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
        AuthModule,
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
        channel.assertQueue('video-converted', {
          durable: true,
          deadLetterExchange: 'dlx.exchange',
          deadLetterRoutingKey: 'videos.convert',
        }),
      ]).then(() => channel.purgeQueue('video-converted'));
    });
  });

  afterEach(async () => {
    await channelWrapper.close();
    await module.close();
  });

  it('should consume video converted event and process video media', async () => {
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

    const videoFake = Video.fake().oneVideoWithAllMedias().build();
    const video = Video.create({
      ...videoFake,
      categoryIds: [new CategoryId(category.categoryId.id)],
      genreIds: [new GenreId(genre.genreId.id)],
      castMemberIds: [new CastMemberId(castMember.castMemberId.id)],
    });
    await videoRepo.insert(video);

    const videoId = video.videoId.id;
    const event = {
      video: {
        resourceId: `${videoId}.video`,
        encodedVideoFolder: `videos/${videoId}/mpeg-dash`,
        status: AudioVideoMediaStatus.COMPLETED,
      },
    };

    await channelWrapper.sendToQueue(
      'video-converted',
      Buffer.from(JSON.stringify(event)),
    );

    await new Promise((resolve) => setTimeout(resolve, 500));
    const audioVideoMediaModel = module.get<typeof AudioVideoMediaModel>(
      getModelToken(AudioVideoMediaModel),
    );
    const allMedia = await audioVideoMediaModel.findAll({
      where: {
        videoId: video.videoId.id,
        videoRelatedField: AudioVideoMediaRelatedField.VIDEO,
      },
    });
    const updatedVideo = allMedia[0];

    expect(updatedVideo.status).toEqual(AudioVideoMediaStatus.COMPLETED);
    expect(updatedVideo.encodedLocation).toEqual(
      event.video.encodedVideoFolder,
    );
  });
});
