import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import {
  createVideoRelations,
  setupSequelizeForVideo,
} from '@core/video/infra/db/sequelize/testing/video-sequelize.helper';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { UpdateVideoUseCase } from '../update-video.use-case';
import { Video, Rating, VideoId } from '@core/video/domain/video.aggregate';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';

describe('Update Genre Use Case Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: UpdateVideoUseCase;
  let videoRepo: VideoSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new UpdateVideoUseCase(
      uow,
      videoRepo,
      categoryRepo,
      genreRepo,
      castMemberRepo,
    );
  });

  describe('execute', () => {
    it('should update a video', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
      const entity = Video.fake()
        .oneVideoWithoutMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepo.insert(entity);

      const {
        category: anotherCategory,
        genre: anotherGenre,
        castMember: anotherCastMember,
      } = await createVideoRelations(categoryRepo, genreRepo, castMemberRepo);
      const input = {
        id: entity.videoId.id,
        title: 'test video',
        description: 'test description',
        yearLaunched: 2021,
        duration: 90,
        rating: Rating.R10,
        isOpened: true,
        categoryIds: [anotherCategory.categoryId.id],
        genreIds: [anotherGenre.genreId.id],
        castMemberIds: [anotherCastMember.castMemberId.id],
      };

      const output = await useCase.execute(input);

      expect(output).toStrictEqual({
        id: expect.any(String),
      });

      const video = await videoRepo.findById(new VideoId(output.id));

      expect(video!.toJSON()).toStrictEqual({
        videoId: entity.videoId.id,
        title: input.title,
        description: input.description,
        yearLaunched: input.yearLaunched,
        duration: input.duration,
        rating: input.rating,
        isOpened: input.isOpened,
        isPublished: false,
        banner: null,
        thumbnail: null,
        thumbnailHalf: null,
        trailer: null,
        video: null,
        categoryIds: expect.arrayContaining([anotherCategory.categoryId.id]),
        genreIds: expect.arrayContaining([anotherGenre.genreId.id]),
        castMemberIds: expect.arrayContaining([
          anotherCastMember.castMemberId.id,
        ]),
        createdAt: expect.any(Date),
      });
    });

    it('rollback transaction when an error occurs', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
      const entity = Video.fake()
        .oneVideoWithoutMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepo.insert(entity);

      const nonExistingCategoryId = new CategoryId();

      await expect(
        useCase.execute({
          id: entity.videoId.id,
          title: 'new title',
          categoryIds: [nonExistingCategoryId.id],
        }),
      ).rejects.toThrow(EntityValidationError);

      const notUpdatedVideo = await videoRepo.findById(entity.videoId);
      expect(notUpdatedVideo!.title).toStrictEqual(entity.title);
    });
  });
});
