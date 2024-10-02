import request from 'supertest';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres/genres.providers';
import { startApp } from 'test/e2e.helper';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { createVideoRelations } from '@core/video/infra/db/sequelize/testing/video-sequelize.helper';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { Video } from '@core/video/domain/video.aggregate';
import { VIDEOS_PROVIDERS } from 'src/nest-modules/videos/videos.providers';
import { VideoOutputMapper } from '@core/video/application/common/video.output';
import { VideosController } from 'src/nest-modules/videos/videos.controller';
import { instanceToPlain } from 'class-transformer';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { Readable } from 'stream';
import { IStorage } from '@core/shared/application/storage.interface';

describe('E2E Videos Controller', () => {
  const appHelper = startApp();
  let videoRepo: VideoSequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;
  let storage: IStorage;

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
    storage = appHelper.app.get<IStorage>('IStorage');
  });

  describe('/videos/:id (POST)', () => {
    it('should return a response error when video is not found', async () => {
      const videoId = 'defa0016-7b96-45ab-8f6b-b339b6409f39';
      const sendData = { title: 'new title' };

      await request(appHelper.app.getHttpServer())
        .patch(`/videos/${videoId}`)
        .send(sendData)
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: `Video Not Found using ID ${videoId}`,
        });
    });

    it('should return a response error when sendingmore than one file', async () => {
      const videoId = 'defa0016-7b96-45ab-8f6b-b339b6409f39';

      // Create file as a readable stream to send in the http request
      const file = new Readable();
      file.push(Buffer.from('data'));
      file.push(null);

      await request(appHelper.app.getHttpServer())
        .patch(`/videos/${videoId}`)
        .attach('video', file as any, {
          filename: 'video.mp4',
          contentType: 'video/mp4',
        })
        .attach('banner', file as any, {
          filename: 'banner.jpeg',
          contentType: 'image/jpeg',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Only one file can be sent at a time',
        });
    });

    it('should upload a file ', async () => {
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

      // Create file as a readable stream to send in the http request
      const file = new Readable();
      const data = Buffer.from('data');
      file.push(data);
      file.push(null);

      const res = await request(appHelper.app.getHttpServer())
        .patch(`/videos/${entity.videoId.id}`)
        .attach('video', file as any, {
          filename: 'video.mp4',
          contentType: 'video/mp4',
        })
        .expect(200);

      const video = await videoRepo.findById(entity.videoId);
      const videoStorageId = video.video.rawUrl;
      const storedFile = await storage.get(videoStorageId);

      expect(storedFile).toEqual({ data, mimeType: 'video/mp4' });

      const presenter = VideosController.serialize(
        VideoOutputMapper.toOutput({
          video,
          allCategoriesOfVideoAndGenre: [category],
          genres: [genre],
          castMembers: [castMember],
        }),
      );
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual({
        ...serialized,
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
