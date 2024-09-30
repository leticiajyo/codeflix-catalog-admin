import { getModelToken } from '@nestjs/sequelize';
import { VideoInMemoryRepository } from '../../core/video/infra/db/in-memory/video-in-memory.repository';
import { IVideoRepository } from '../../core/video/domain/video.repository';
import { UnitOfWorkSequelize } from '../../core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { IUnitOfWork } from '../../core/shared/domain/repository/unit-of-work.interface';
import { VideoSequelizeRepository } from '../../core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '../../core/video/infra/db/sequelize/video.model';
import { IGenreRepository } from '../../core/genre/domain/genre.repository';
import { ICastMemberRepository } from '../../core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '../../core/category/domain/category.repository';
import { ApplicationService } from '../../core/shared/application/application.service';
import { IStorage } from '../../core/shared/application/storage.interface';
import { CreateVideoUseCase } from '@core/video/application/use-cases/create-video/create-video.use-case';
import { GetVideoUseCase } from '@core/video/application/use-cases/get-video/get-video.use-case';
import { ProcessAudioVideoMediasUseCase } from '@core/video/application/use-cases/process-audio-video-medias/process-audio-video-medias.use-case';
import { UpdateVideoUseCase } from '@core/video/application/use-cases/update-video/update-video.use-case';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { CAST_MEMBERS_PROVIDERS } from '../cast-members/cast-members.providers';
import { CATEGORY_PROVIDERS } from '../categories/categories.providers';
import { GENRES_PROVIDERS } from '../genres/genres.providers';
import { UploadImageMediasUseCase } from '@core/video/application/use-cases/upload-image-medias/upload-image-medias.use-case';
import { PublishVideoMediaReplacedInQueueHandler } from '@core/video/application/handlers/publish-video-media-replaced-in-queue.handler';

export const REPOSITORIES = {
  VIDEO_REPOSITORY: {
    provide: 'VideoRepository',
    useExisting: VideoSequelizeRepository,
  },
  VIDEO_IN_MEMORY_REPOSITORY: {
    provide: VideoInMemoryRepository,
    useClass: VideoInMemoryRepository,
  },
  VIDEO_SEQUELIZE_REPOSITORY: {
    provide: VideoSequelizeRepository,
    useFactory: (videoModel: typeof VideoModel, uow: UnitOfWorkSequelize) => {
      return new VideoSequelizeRepository(videoModel, uow);
    },
    inject: [getModelToken(VideoModel), 'UnitOfWork'],
  },
};

export const USE_CASES = {
  CREATE_VIDEO_USE_CASE: {
    provide: CreateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      categoryRepo: ICategoryRepository,
      genreRepo: IGenreRepository,
      castMemberRepo: ICastMemberRepository,
    ) => {
      return new CreateVideoUseCase(
        uow,
        videoRepo,
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    ],
  },
  UPDATE_VIDEO_USE_CASE: {
    provide: UpdateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      categoryRepo: ICategoryRepository,
      genreRepo: IGenreRepository,
      castMemberRepo: ICastMemberRepository,
    ) => {
      return new UpdateVideoUseCase(
        uow,
        videoRepo,
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    ],
  },
  UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: UploadAudioVideoMediasUseCase,
    useFactory: (
      appService: ApplicationService,
      videoRepo: IVideoRepository,
      storage: IStorage,
    ) => {
      return new UploadAudioVideoMediasUseCase(appService, videoRepo, storage);
    },
    inject: [
      ApplicationService,
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      'IStorage',
    ],
  },
  UPLOAD_IMAGE_MEDIA_USE_CASE: {
    provide: UploadImageMediasUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      storage: IStorage,
    ) => {
      return new UploadImageMediasUseCase(uow, videoRepo, storage);
    },
    inject: [
      ApplicationService,
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      'IStorage',
    ],
  },
  GET_VIDEO_USE_CASE: {
    provide: GetVideoUseCase,
    useFactory: (
      videoRepo: IVideoRepository,
      categoryRepo: ICategoryRepository,
      genreRepo: IGenreRepository,
      castMemberRepo: ICastMemberRepository,
    ) => {
      return new GetVideoUseCase(
        videoRepo,
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
    },
    inject: [
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    ],
  },
  PROCESS_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: ProcessAudioVideoMediasUseCase,
    useFactory: (uow: IUnitOfWork, videoRepo: IVideoRepository) => {
      return new ProcessAudioVideoMediasUseCase(uow, videoRepo);
    },
    inject: ['UnitOfWork', REPOSITORIES.VIDEO_REPOSITORY.provide],
  },
};

export const HANDLERS = {
  PUBLISH_VIDEO_MEDIA_REPLACED_IN_QUEUE_HANDLER: {
    provide: PublishVideoMediaReplacedInQueueHandler,
    useClass: PublishVideoMediaReplacedInQueueHandler,
  },
};

export const VIDEOS_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
  HANDLERS,
};
