import request from 'supertest';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres/genres.providers';
import { startApp } from 'test/e2e.helper';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { createVideoRelations } from '@core/video/infra/db/sequelize/testing/video-sequelize.helper';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { CreateVideoDto } from 'src/nest-modules/videos/dto/create-video.dto';
import { Rating, VideoId } from '@core/video/domain/video.aggregate';
import { VIDEOS_PROVIDERS } from 'src/nest-modules/videos/videos.providers';
import { VideoOutputMapper } from '@core/video/application/common/video.output';
import { VideosController } from 'src/nest-modules/videos/videos.controller';
import { instanceToPlain } from 'class-transformer';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';

describe('E2E Videos Controller', () => {
  const appHelper = startApp();
  let videoRepo: VideoSequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;

  beforeEach(async () => {
    videoRepo = appHelper.app.get<VideoSequelizeRepository>(
      VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
    );
    genreRepo = appHelper.app.get<GenreSequelizeRepository>(
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    categoryRepo = appHelper.app.get<CategorySequelizeRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
    castMemberRepo = appHelper.app.get<CastMemberSequelizeRepository>(
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
  });

  describe('/videoss (POST)', () => {
    it('should return a response error with status 400 when request body is invalid', async () => {
      const sendData = {
        title: 'test video',
        description: 'test description',
        yearLaunched: 2021,
        duration: 90,
        rating: Rating.R10,
        isOpened: true,
      };

      await request(appHelper.app.getHttpServer())
        .post('/videos')
        .send(sendData)
        .expect(400)
        .expect({
          message: [
            'categoryIds should not be empty',
            'categoryIds must be an array',
            'each value in categoryIds must be a UUID',
            'genreIds should not be empty',
            'genreIds must be an array',
            'each value in genreIds must be a UUID',
            'castMemberIds should not be empty',
            'castMemberIds must be an array',
            'each value in castMemberIds must be a UUID',
          ],
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should return a response error with status 422 when EntityValidationError is thrown', async () => {
      const sendData = {
        title: 'test video',
        description: 'test description',
        yearLaunched: 2021,
        duration: 90,
        rating: Rating.R10,
        isOpened: true,
        categoryIds: ['f7e697bd-8fab-4e53-852c-709031461462'],
        genreIds: ['e533123b-ed89-4ab1-aed1-27d37785549a'],
        castMemberIds: ['3ed5e31e-c375-4c2f-b736-a18e6d312eb0'],
      };

      await request(appHelper.app.getHttpServer())
        .post('/videos')
        .send(sendData)
        .expect(422)
        .expect({
          statusCode: 422,
          error: 'Unprocessable Entity',
          message: [
            'Category Not Found using ID f7e697bd-8fab-4e53-852c-709031461462',
            'Genre Not Found using ID e533123b-ed89-4ab1-aed1-27d37785549a',
            'CastMember Not Found using ID 3ed5e31e-c375-4c2f-b736-a18e6d312eb0',
          ],
        });
    });

    it('should create a video', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );

      const sendData: CreateVideoDto = {
        title: 'test video',
        description: 'test description',
        yearLaunched: 2021,
        duration: 90,
        rating: Rating.R10,
        isOpened: true,
        categoryIds: [category.categoryId.id],
        genreIds: [genre.genreId.id],
        castMemberIds: [castMember.castMemberId.id],
      };

      const res = await request(appHelper.app.getHttpServer())
        .post('/videos')
        .send(sendData)
        .expect(201);

      const id = res.body.data.id;
      const videoCreated = await videoRepo.findById(new VideoId(id));
      expect(videoCreated).toBeDefined();

      const presenter = VideosController.serialize(
        VideoOutputMapper.toOutput({
          video: videoCreated,
          allCategoriesOfVideoAndGenre: [category],
          genres: [genre],
          castMembers: [castMember],
        }),
      );
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual({
        id: serialized.id,
        createdAt: serialized.createdAt,
        isPublished: false,
        ...sendData,
        categories: expect.arrayContaining([
          {
            id: category.categoryId.id,
            name: category.name,
            createdAt: category.createdAt.toISOString(),
          },
        ]),
        genres: expect.arrayContaining([
          {
            id: genre.genreId.id,
            name: genre.name,
            isActive: genre.isActive,
            categoryIds: [category.categoryId.id],
            categories: expect.arrayContaining([
              {
                id: category.categoryId.id,
                name: category.name,
                createdAt: category.createdAt.toISOString(),
              },
            ]),
            createdAt: genre.createdAt.toISOString(),
          },
        ]),
        castMembers: expect.arrayContaining([
          {
            id: castMember.castMemberId.id,
            name: castMember.name,
            type: castMember.type,
            createdAt: castMember.createdAt.toISOString(),
          },
        ]),
      });
    });
  });
});
