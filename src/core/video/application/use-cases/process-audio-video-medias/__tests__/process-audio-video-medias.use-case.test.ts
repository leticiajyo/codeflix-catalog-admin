import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import {
  createVideoRelations,
  setupSequelizeForVideo,
} from '@core/video/infra/db/sequelize/testing/video-sequelize.helper';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { ProcessAudioVideoMediasUseCase } from '../process-audio-video-medias.use-case';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';

describe('Process Audio Video Medias Use Case', () => {
  let processAudioVideoMediasUseCase: ProcessAudioVideoMediasUseCase;
  let videoRepo: IVideoRepository;
  let categoryRepo: CategorySequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;
  let uow: UnitOfWorkSequelize;
  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);

    processAudioVideoMediasUseCase = new ProcessAudioVideoMediasUseCase(
      uow,
      videoRepo,
    );
  });

  describe('execute', () => {
    it('should throw error when video is not found', async () => {
      await expect(
        processAudioVideoMediasUseCase.execute({
          videoId: '4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b',
          encodedLocation: 'encoded location',
          field: 'trailer',
          status: AudioVideoMediaStatus.COMPLETED,
        }),
      ).rejects.toThrow(
        new NotFoundError('4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b', Video),
      );
    });

    it('should complete audio video processing', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
      const video = Video.fake()
        .oneVideoWithAllMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepo.insert(video);

      await processAudioVideoMediasUseCase.execute({
        videoId: video.videoId.id,
        encodedLocation: 'encoded location',
        field: 'trailer',
        status: AudioVideoMediaStatus.COMPLETED,
      });

      const videoUpdated = await videoRepo.findById(video.videoId);

      expect(videoUpdated.trailer).toEqual(
        expect.objectContaining({
          encodedLocation: 'encoded location',
          status: AudioVideoMediaStatus.COMPLETED,
        }),
      );
    });
  });
});
