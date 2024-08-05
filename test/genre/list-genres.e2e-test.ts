import request from 'supertest';
import qs from 'qs';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';
import { ListGenresFixture } from 'src/nest-modules/genres/__tests__/genre.fixture';
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

  describe('/genres (GET)', () => {
    describe('should return genres sorted by createdAt when request query is empty', () => {
      const { relations, entitiesMap, arrange } =
        ListGenresFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await categoryRepo.bulkInsert(
          Array.from(relations.categories.values()),
        );
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is $label',
        async ({ sendData, expected }) => {
          const queryParams = new URLSearchParams(sendData as any).toString();

          const response = await request(appHelper.app.getHttpServer())
            .get(`/genres/?${queryParams}`)
            .expect(200);

          const data = expected.entities.map((e) => ({
            id: e.genreId.id,
            name: e.name,
            isActive: e.isActive,
            categoryIds: expect.arrayContaining(
              Array.from(e.categoryIds.keys()),
            ),
            categories: expect.arrayContaining(
              Array.from(relations.categories.values())
                .filter((c) => e.categoryIds.has(c.categoryId.id))
                .map((c) => ({
                  id: c.categoryId.id,
                  name: c.name,
                  createdAt: c.createdAt.toISOString(),
                })),
            ),
            createdAt: e.createdAt.toISOString(),
          }));
          expect(response.body).toStrictEqual({
            data: data,
            meta: expected.meta,
          });
        },
      );
    });

    describe('should return genres using paginate, filter and sort', () => {
      const { relations, entitiesMap, arrange } =
        ListGenresFixture.arrangeUnsorted();

      beforeEach(async () => {
        await categoryRepo.bulkInsert(
          Array.from(relations.categories.values()),
        );
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is $label',
        async ({ sendData, expected }) => {
          const queryParams = qs.stringify(sendData as any);

          const response = await request(appHelper.app.getHttpServer())
            .get(`/genres/?${queryParams}`)
            .expect(200);

          const data = expected.entities.map((e) => ({
            id: e.genreId.id,
            name: e.name,
            isActive: e.isActive,
            categoryIds: expect.arrayContaining(
              Array.from(e.categoryIds.keys()),
            ),
            categories: expect.arrayContaining(
              Array.from(relations.categories.values())
                .filter((c) => e.categoryIds.has(c.categoryId.id))
                .map((c) => ({
                  id: c.categoryId.id,
                  name: c.name,
                  createdAt: c.createdAt.toISOString(),
                })),
            ),
            createdAt: e.createdAt.toISOString(),
          }));
          expect(response.body).toStrictEqual({
            data: data,
            meta: expected.meta,
          });
        },
      );
    });
  });
});
