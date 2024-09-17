import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreId, Genre } from '@core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { GetVideoUseCase } from '../get-video.use-case';
import {
  createVideoRelations,
  setupSequelizeForVideo,
} from '@core/video/infra/db/sequelize/testing/video-sequelize.helper';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Rating, Video, VideoId } from '@core/video/domain/video.aggregate';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';

describe('Get Video Use Case', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: GetVideoUseCase;
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
    useCase = new GetVideoUseCase(
      videoRepo,
      categoryRepo,
      genreRepo,
      castMemberRepo,
    );
  });

  describe('execute', () => {
    it('should throw an error when entity is not found', async () => {
      const videoId = new VideoId();

      await expect(() => useCase.execute({ id: videoId.id })).rejects.toThrow(
        new NotFoundError(videoId.id, Video),
      );
    });

    it('should return a video', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );

      const video = Video.create({
        title: 'test video',
        description: 'test description',
        yearLaunched: 2021,
        duration: 90,
        rating: Rating.R10,
        isOpened: true,
        categoryIds: [new CategoryId(category.categoryId.id)],
        genreIds: [new GenreId(genre.genreId.id)],
        castMemberIds: [new CastMemberId(castMember.castMemberId.id)],
      });
      await videoRepo.insert(video);

      const output = await useCase.execute({ id: video.videoId.id });

      expect(output).toStrictEqual({
        id: video.videoId.id,
        title: video.title,
        description: video.description,
        yearLaunched: video.yearLaunched,
        duration: video.duration,
        rating: video.rating,
        isOpened: video.isOpened,
        isPublished: video.isPublished,
        createdAt: video.createdAt,
        categoryIds: [category.categoryId.id],
        categories: [
          {
            id: category.categoryId.id,
            name: category.name,
            createdAt: category.createdAt,
          },
        ],
        genreIds: [genre.genreId.id],
        genres: [
          {
            id: genre.genreId.id,
            isActive: genre.isActive,
            name: genre.name,
            createdAt: genre.createdAt,
            categoryIds: [category.categoryId.id],
            categories: [
              {
                id: category.categoryId.id,
                name: category.name,
                createdAt: category.createdAt,
              },
            ],
          },
        ],
        castMemberIds: [castMember.castMemberId.id],
        castMembers: [
          {
            id: castMember.castMemberId.id,
            name: castMember.name,
            type: castMember.type,
            createdAt: castMember.createdAt,
          },
        ],
      });
    });
  });
});
