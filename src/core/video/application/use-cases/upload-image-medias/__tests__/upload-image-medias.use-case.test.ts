import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { IStorage } from '@core/shared/application/storage.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { InMemoryStorage } from '@core/shared/infra/storage/in-memory.storage';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import {
  createVideoRelations,
  setupSequelizeForVideo,
} from '@core/video/infra/db/sequelize/testing/video-sequelize.helper';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { UploadImageMediasUseCase } from '../upload-image-medias.use-case';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

describe('UploadImageMediasUseCase Integration Tests', () => {
  let uploadImageMediasUseCase: UploadImageMediasUseCase;
  let videoRepo: IVideoRepository;
  let categoryRepo: CategorySequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;
  let uow: UnitOfWorkSequelize;
  let storageService: IStorage;
  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    storageService = new InMemoryStorage();

    uploadImageMediasUseCase = new UploadImageMediasUseCase(
      uow,
      videoRepo,
      storageService,
    );
  });

  describe('execute', () => {
    it('should throw error when video is not found', async () => {
      await expect(
        uploadImageMediasUseCase.execute({
          videoId: '4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b',
          field: 'banner',
          file: {
            rawName: 'banner.jpg',
            data: Buffer.from(''),
            mimeType: 'image/jpg',
            size: 100,
          },
        }),
      ).rejects.toThrow(
        new NotFoundError('4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b', Video),
      );
    });

    it('should throw error when image is invalid', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
      const video = Video.fake()
        .oneVideoWithoutMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepo.insert(video);

      try {
        await uploadImageMediasUseCase.execute({
          videoId: video.videoId.id,
          field: 'banner',
          file: {
            rawName: 'banner.jpg',
            data: Buffer.from(''),
            mimeType: 'image/jpg',
            size: 100,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.errors).toEqual([
          {
            banner: [
              'Invalid media file mime type: image/jpg not in image/jpeg, image/png, image/gif',
            ],
          },
        ]);
      }
    });

    it('should upload banner image', async () => {
      const storeSpy = jest.spyOn(storageService, 'store');

      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
      const video = Video.fake()
        .oneVideoWithoutMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepo.insert(video);

      await uploadImageMediasUseCase.execute({
        videoId: video.videoId.id,
        field: 'banner',
        file: {
          rawName: 'banner.jpeg',
          data: Buffer.from('test data'),
          mimeType: 'image/jpeg',
          size: 100,
        },
      });

      const videoUpdated = await videoRepo.findById(video.videoId);

      expect(videoUpdated.banner.name.includes('.jpeg')).toBeTruthy();
      expect(videoUpdated.banner.location).toBe(
        `videos/${videoUpdated.videoId.id}/images`,
      );
      expect(storeSpy).toHaveBeenCalledWith({
        data: Buffer.from('test data'),
        id: videoUpdated.banner.url,
        mimeType: 'image/jpeg',
      });
    });
  });
});
