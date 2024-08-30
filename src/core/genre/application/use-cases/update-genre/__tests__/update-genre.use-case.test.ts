import { UpdateGenreUseCase } from '../update-genre.use-case';
import { Genre } from '../../../../domain/genre.aggregate';

import { UnitOfWorkSequelize } from '../../../../../shared/infra/db/sequelize/unit-of-work-sequelize';
import {
  Category,
  CategoryId,
} from '../../../../../category/domain/category.aggregate';
import { UpdateGenreInput } from '../update-genre.input';
import { GenreSequelizeRepository } from '../../../../infra/db/sequelize/genre-sequelize.repository';
import { CategorySequelizeRepository } from '../../../../../category/infra/db/sequelize/category-sequelize.repository';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../../../infra/db/sequelize/genre.model';
import { CategoryModel } from '../../../../../category/infra/db/sequelize/category.model';
import { setupSequelize } from '@core/shared/infra/testing/sequelize.helper';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';

describe('UpdateGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: UpdateGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);

    useCase = new UpdateGenreUseCase(uow, genreRepo, categoryRepo);
  });

  describe('execute', () => {
    it('should update a genre', async () => {
      const categories = Category.fake().manyCategories(2).build();
      await categoryRepo.bulkInsert(categories);

      const entity = Genre.fake()
        .oneGenre()
        .addCategoryId(categories[1].categoryId)
        .build();
      await genreRepo.insert(entity);

      const output = await useCase.execute(
        new UpdateGenreInput({
          id: entity.genreId.id,
          name: 'test',
          categoryIds: [categories[0].categoryId.id],
          isActive: false,
        }),
      );

      expect(output).toStrictEqual({
        id: entity.genreId.id,
        name: 'test',
        categories: expect.arrayContaining(
          [categories[0]].map((e) => ({
            id: e.categoryId.id,
            name: e.name,
            createdAt: e.createdAt,
          })),
        ),
        categoryIds: expect.arrayContaining([categories[0].categoryId.id]),
        isActive: false,
        createdAt: entity.createdAt,
      });
    });

    it('rollback transaction when an error occurs', async () => {
      const category = Category.fake().oneCategory().build();
      await categoryRepo.insert(category);

      const entity = Genre.fake()
        .oneGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepo.insert(entity);

      const nonExistingCategoryId = new CategoryId();

      await expect(
        useCase.execute(
          new UpdateGenreInput({
            id: entity.genreId.id,
            name: 'test',
            categoryIds: [nonExistingCategoryId.id],
          }),
        ),
      ).rejects.toThrow(EntityValidationError);

      const notUpdatedGenre = await genreRepo.findById(entity.genreId);
      expect(notUpdatedGenre!.name).toStrictEqual(entity.name);
    });
  });
});
