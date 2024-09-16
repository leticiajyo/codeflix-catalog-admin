import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { VideoId, Rating } from '@core/video/domain/video.aggregate';
import {
  createVideoRelations,
  setupSequelizeForVideo,
} from '@core/video/infra/db/sequelize/testing/video-sequelize.helper';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { CreateVideoUseCase } from '../create-video.use-case';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';

describe('Create Video Use Case', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: CreateVideoUseCase;
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
    useCase = new CreateVideoUseCase(
      uow,
      videoRepo,
      categoryRepo,
      genreRepo,
      castMemberRepo,
    );
  });

  describe('execute', () => {
    it('should create a video', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );

      const output = await useCase.execute({
        title: 'test video',
        description: 'test description',
        yearLaunched: 2021,
        duration: 90,
        rating: Rating.R10,
        isOpened: true,
        categoryIds: [category.categoryId.id],
        genreIds: [genre.genreId.id],
        castMemberIds: [castMember.castMemberId.id],
      });

      expect(output).toStrictEqual({
        id: expect.any(String),
      });

      const video = await videoRepo.findById(new VideoId(output.id));

      expect(video!.toJSON()).toStrictEqual({
        videoId: expect.any(String),
        title: 'test video',
        description: 'test description',
        yearLaunched: 2021,
        duration: 90,
        rating: Rating.R10,
        isOpened: true,
        isPublished: false,
        banner: null,
        thumbnail: null,
        thumbnailHalf: null,
        trailer: null,
        video: null,
        categoryIds: expect.arrayContaining([category.categoryId.id]),
        genreIds: expect.arrayContaining([genre.genreId.id]),
        castMemberIds: expect.arrayContaining([castMember.castMemberId.id]),
        createdAt: expect.any(Date),
      });
    });

    it('rollback transaction', async () => {
      const categoryId = new CategoryId();
      const genreId = new GenreId();
      const castMemberId = new CastMemberId();

      const input = {
        title: 't'.repeat(256),
        rating: Rating.R10,
        categoryIds: [categoryId.id],
        genreIds: [genreId.id],
        castMemberIds: [castMemberId.id],
      } as any;

      await expect(useCase.execute(input)).rejects.toThrow(
        EntityValidationError,
      );

      const videos = await videoRepo.findAll();
      expect(videos.length).toEqual(0);
    });
  });
});
