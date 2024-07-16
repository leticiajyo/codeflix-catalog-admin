import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { ICategoryRepository } from '../../src/core/category/domain/category.repository';
import { Uuid } from '../../src/core/shared/domain/value-objects/uuid.vo';
import { Category } from '../../src/core/category/domain/category.entity';
import { startApp } from 'test/e2e.helper';
import { CategoryOutputMapper } from '@core/category/application/common/category.output';
import { UpdateCategoryFixture } from 'src/nest-modules/categories/__tests__/category.fixture';
import { CategoriesController } from 'src/nest-modules/categories/categories.controller';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';

describe('CategoriesController (e2e)', () => {
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

  describe('/categories/:id (PATCH)', () => {
    describe('should return error when id is invalid or not found', () => {
      const nestApp = startApp();
      const faker = Category.fake().oneCategory().build();
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          sendData: { name: faker.name },
          expected: {
            message:
              'Category Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
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
          return request(nestApp.app.getHttpServer())
            .patch(`/categories/${id}`)
            .send(sendData)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe('should a response error with 400 when request body is invalid', () => {
      const app = startApp();
      const invalidRequest = UpdateCategoryFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));
      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .patch(`/categories/${uuid}`)
          .send(value.sendData)
          .expect(400)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const app = startApp();
      const validationError =
        UpdateCategoryFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationError).map((key) => ({
        label: key,
        value: validationError[key],
      }));
      let categoryRepo: ICategoryRepository;

      beforeEach(() => {
        categoryRepo = app.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });
      test.each(arrange)('when body is $label', async ({ value }) => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        return request(app.app.getHttpServer())
          .patch(`/categories/${category.categoryId.id}`)
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should update a category', () => {
      const appHelper = startApp();
      const arrange = UpdateCategoryFixture.arrangeForUpdate();
      let categoryRepo: ICategoryRepository;

      beforeEach(async () => {
        categoryRepo = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });
      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected }) => {
          const categoryCreated = Category.fake().oneCategory().build();
          await categoryRepo.insert(categoryCreated);

          const res = await request(appHelper.app.getHttpServer())
            .patch(`/categories/${categoryCreated.categoryId.id}`)
            .send(sendData)
            .expect(200);
          const keyInResponse = UpdateCategoryFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
          const id = res.body.data.id;
          const categoryUpdated = await categoryRepo.findById(new Uuid(id));
          const presenter = CategoriesController.serialize(
            CategoryOutputMapper.toOutput(categoryUpdated),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual(serialized);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            createdAt: serialized.createdAt,
            name: expected.name ?? categoryUpdated.name,
            description:
              'description' in expected
                ? expected.description
                : categoryUpdated.description,
            isActive: expected.isActive ?? categoryUpdated.isActive,
          });
        },
      );
    });
  });
});
