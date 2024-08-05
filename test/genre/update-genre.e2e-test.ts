import request from 'supertest';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres/genres.providers';
import { startApp } from 'test/e2e.helper';
import { UpdateGenreFixture } from 'src/nest-modules/genres/__tests__/genre.fixture';
import { Category } from '@core/category/domain/category.aggregate';
import { GenreOutputMapper } from '@core/genre/application/common/genre.output';
import { instanceToPlain } from 'class-transformer';
import { GenresController } from 'src/nest-modules/genres/genres.controller';

describe('E2E Genres Controller', () => {
  const appHelper = startApp();
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

  beforeEach(async () => {
    genreRepo = appHelper.app.get<GenreSequelizeRepository>(
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    categoryRepo = appHelper.app.get<CategorySequelizeRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('/genres/:id (PATCH)', () => {
    describe('should return response error when id is invalid or not found', () => {
      const faker = Genre.fake().oneGenre().build();
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          sendData: { name: faker.name },
          expected: {
            message:
              'Genre Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          sendData: { name: faker.name },
          expected: {
            statusCode: 400,
            message: 'Validation failed (uuid is expected)',
            error: 'Bad Request',
          },
        },
      ];

      test.each(arrange)(
        'when id is $id',
        async ({ id, sendData, expected }) => {
          return request(appHelper.app.getHttpServer())
            .patch(`/genres/${id}`)
            .send(sendData)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe('should return a 400 when request body is invalid', () => {
      const invalidRequest = UpdateGenreFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .patch(`/genres/${uuid}`)
          .send(value.sendData)
          .expect(400)
          .expect(value.expected);
      });
    });

    describe('should retun a 422 when EntityValidationError is thrown', () => {
      const validationErrors =
        UpdateGenreFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationErrors).map((key) => ({
        label: key,
        value: validationErrors[key],
      }));

      test.each(arrange)('when body is $label', async ({ value }) => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .oneGenre()
          .addCategoryId(category.categoryId)
          .build();

        await genreRepo.insert(genre);

        return request(appHelper.app.getHttpServer())
          .patch(`/genres/${genre.genreId.id}`)
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should update a genre', () => {
      const arrange = UpdateGenreFixture.arrangeForSave();

      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected, relations }) => {
          const category = Category.fake().oneCategory().build();
          await categoryRepo.bulkInsert([category, ...relations.categories]);
          const genreCreated = Genre.fake()
            .oneGenre()
            .addCategoryId(category.categoryId)
            .build();
          await genreRepo.insert(genreCreated);

          const res = await request(appHelper.app.getHttpServer())
            .patch(`/genres/${genreCreated.genreId.id}`)
            .send(sendData)
            .expect(200);

          const keyInResponse = UpdateGenreFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

          const genreUpdated = await genreRepo.findById(
            new GenreId(res.body.data.id),
          );
          const presenter = GenresController.serialize(
            GenreOutputMapper.toOutput(genreUpdated, relations.categories),
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
