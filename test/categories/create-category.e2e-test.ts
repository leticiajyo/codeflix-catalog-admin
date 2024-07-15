import request from 'supertest';

import { Uuid } from '../../src/core/shared/domain/value-objects/uuid.vo';

import { instanceToPlain } from 'class-transformer';
import { CategoryOutputMapper } from '@core/category/application/common/category.output';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategoriesController } from 'src/nest-modules/categories/categories.controller';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';
import { startApp } from 'test/e2e.helper';
import { CreateCategoryFixture } from 'src/nest-modules/categories/__tests__/category.fixture';

describe('E2E Categories Controller', () => {
  const appHelper = startApp();
  let categoryRepo: ICategoryRepository;

  beforeEach(async () => {
    categoryRepo = appHelper.app.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('/categories (POST)', () => {
    describe('should return a response error with 400 status code when request body is invalid', () => {
      const invalidRequest = CreateCategoryFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/categories')
          .send(value.sendData)
          .expect(400)
          .expect(value.expected);
      });
    });

    describe('should return a response error with 422 status code when throw EntityValidationError', () => {
      const invalidRequest =
        CreateCategoryFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/categories')
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should create a category', () => {
      const arrange = CreateCategoryFixture.arrangeForCreate();

      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected }) => {
          const res = await request(appHelper.app.getHttpServer())
            .post('/categories')
            .send(sendData)
            .expect(201);

          const keysInResponse = CreateCategoryFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);
          const id = res.body.data.id;
          const categoryCreated = await categoryRepo.findById(new Uuid(id));

          const presenter = CategoriesController.serialize(
            CategoryOutputMapper.toOutput(categoryCreated),
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
