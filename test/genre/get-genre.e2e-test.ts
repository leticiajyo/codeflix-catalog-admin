import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { Genre } from '../../src/core/genre/domain/genre.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
import { GenreOutputMapper } from '@core/genre/application/common/genre.output';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';
import { GenresController } from 'src/nest-modules/genres/genres.controller';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres/genres.providers';
import { startApp } from 'test/e2e.helper';
import { GetGenreFixture } from 'src/nest-modules/genres/__tests__/genre.fixture';
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

  describe('/genres/:id (GET)', () => {
    describe('should return a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'Genre Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 400,
            message: 'Validation failed (uuid is expected)',
            error: 'Bad Request',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return request(appHelper.app.getHttpServer())
          .get(`/genres/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should return a genre ', async () => {
      const categories = Category.fake().manyCategories(3).build();
      await categoryRepo.bulkInsert(categories);

      const genre = Genre.fake()
        .oneGenre()
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .addCategoryId(categories[2].categoryId)
        .build();
      await genreRepo.insert(genre);

      const res = await request(appHelper.app.getHttpServer())
        .get(`/genres/${genre.genreId.id}`)
        .expect(200);
      const keyInResponse = GetGenreFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

      const presenter = GenresController.serialize(
        GenreOutputMapper.toOutput(genre, categories),
      );
      const serialized = instanceToPlain(presenter);
      serialized.categoryIds = expect.arrayContaining(serialized.categoryIds);
      serialized.categories = expect.arrayContaining(
        serialized.categories.map((category) => ({
          id: category.id,
          name: category.name,
          createdAt: category.createdAt,
        })),
      );
      expect(res.body.data).toEqual(serialized);
    });
  });
});
