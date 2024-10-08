import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { VIDEOS_PROVIDERS } from './videos.providers';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '../../core/video/infra/db/sequelize/video.model';
import { ImageMediaModel } from '../../core/video/infra/db/sequelize/image-media.model';
import { AudioVideoMediaModel } from '../../core/video/infra/db/sequelize/audio-video-media.model';
import { CastMembersModule } from '../cast-members/cast-members.module';
import { CategoriesModule } from '../categories/categories.module';
import { GenresModule } from '../genres/genres.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      VideoModel,
      VideoCategoryModel,
      VideoGenreModel,
      VideoCastMemberModel,
      ImageMediaModel,
      AudioVideoMediaModel,
    ]),
    RabbitmqModule.forFeature(),
    CategoriesModule,
    GenresModule,
    CastMembersModule,
  ],
  controllers: [VideosController],
  providers: [
    ...Object.values(VIDEOS_PROVIDERS.REPOSITORIES),
    ...Object.values(VIDEOS_PROVIDERS.USE_CASES),
    ...Object.values(VIDEOS_PROVIDERS.HANDLERS),
    ...Object.values(VIDEOS_PROVIDERS.CONSUMERS),
  ],
})
export class VideosModule {}
