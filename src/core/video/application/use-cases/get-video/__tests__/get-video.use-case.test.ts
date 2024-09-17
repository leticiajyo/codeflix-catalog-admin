import { CategoryId } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreId } from '@core/genre/domain/genre.aggregate';
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
import { Video, VideoId } from '@core/video/domain/video.aggregate';
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

      const videoFake = Video.fake().oneVideoWithoutMedias().build();
      const entity = Video.create({
        ...videoFake,
        categoryIds: [new CategoryId(category.categoryId.id)],
        genreIds: [new GenreId(genre.genreId.id)],
        castMemberIds: [new CastMemberId(castMember.castMemberId.id)],
      });
      await videoRepo.insert(entity);

      const output = await useCase.execute({ id: entity.videoId.id });

      expect(output).toStrictEqual({
        id: entity.videoId.id,
        title: entity.title,
        description: entity.description,
        yearLaunched: entity.yearLaunched,
        duration: entity.duration,
        rating: entity.rating,
        isOpened: entity.isOpened,
        isPublished: entity.isPublished,
        createdAt: entity.createdAt,
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
