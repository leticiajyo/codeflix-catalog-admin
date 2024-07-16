import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';
import { ListCategoriesFixture } from 'src/nest-modules/categories/__tests__/category.fixture';
import { CategoryOutputMapper } from '@core/category/application/common/category.output';
import { CategoriesController } from 'src/nest-modules/categories/categories.controller';
import { startApp } from 'test/e2e.helper';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';

describe('E2E Categories Controller', () => {
  describe('/categories (GET)', () => {
    describe('should return categories sorted by createdAt when request query is empty', () => {
      let categoryRepo: CategorySequelizeRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        categoryRepo = nestApp.app.get<CategorySequelizeRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await categoryRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query params is $sendData',
        async ({ sendData, expected }) => {
          const queryParams = new URLSearchParams(sendData as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CategoriesController.serialize(
                    CategoryOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });

    describe('should return categories using paginate, filter and sort', () => {
      let categoryRepo: CategorySequelizeRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        categoryRepo = nestApp.app.get<CategorySequelizeRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await categoryRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query params is $sendData',
        async ({ sendData, expected }) => {
          const queryParams = new URLSearchParams(sendData as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CategoriesController.serialize(
                    CategoryOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });
  });
});
