import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { GenreId } from '../../src/core/genre/domain/genre.aggregate';
import { GenreOutputMapper } from '@core/genre/application/common/genre.output';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';
import { CreateGenreFixture } from 'src/nest-modules/genres/__tests__/genre.fixture';
import { GenresController } from 'src/nest-modules/genres/genres.controller';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres/genres.providers';
import { startApp } from 'test/e2e.helper';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';

describe('E2E Genres Controller', () => {
  const appHelper = startApp();
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  beforeEach(async () => {
    genreRepo = appHelper.app.get<GenreSequelizeRepository>(
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    categoryRepo = appHelper.app.get<CategorySequelizeRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('/genres (POST)', () => {
    describe('should return a response error with status 400 when request body is invalid', () => {
      const invalidRequest = CreateGenreFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/genres')
          .send(value.sendData)
          .expect(400)
          .expect(value.expected);
      });
    });

    describe('should return a response error with status 422 when EntityValidationError is thrown', () => {
      const validationErrors =
        CreateGenreFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationErrors).map((key) => ({
        label: key,
        value: validationErrors[key],
      }));
      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/genres')
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should create a genre', () => {
      const arrange = CreateGenreFixture.arrangeForSave();
      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected, relations }) => {
          await categoryRepo.bulkInsert(relations.categories);

          const res = await request(appHelper.app.getHttpServer())
            .post('/genres')
            .send(sendData)
            .expect(201);

          const keyInResponse = CreateGenreFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

          const id = res.body.data.id;
          const genreCreated = await genreRepo.findById(new GenreId(id));
          const presenter = GenresController.serialize(
            GenreOutputMapper.toOutput(genreCreated!, relations.categories),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            createdAt: serialized.createdAt,
            ...expected,
          });
        },
      );
    });
  });
});
