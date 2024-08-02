import { CreateGenreUseCase } from '../create-genre.use-case';
import { GenreId } from '../../../../domain/genre.aggregate';
import { UnitOfWorkSequelize } from '../../../../../shared/infra/db/sequelize/unit-of-work-sequelize';
import {
  Category,
  CategoryId,
} from '../../../../../category/domain/category.aggregate';
import { GenreSequelizeRepository } from '../../../../infra/db/sequelize/genre-sequelize.repository';
import { CategorySequelizeRepository } from '../../../../../category/infra/db/sequelize/category-sequelize.repository';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../../../infra/db/sequelize/genre-model';
import { CategoryModel } from '../../../../../category/infra/db/sequelize/category.model';
import { setupSequelize } from '@core/shared/infra/testing/sequelize.helper';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';

describe('Create Genre Use Case', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: CreateGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    useCase = new CreateGenreUseCase(uow, genreRepo, categoryRepo);
  });

  describe('execute', () => {
    it('should create a genre', async () => {
      const categories = Category.fake().manyCategories(2).build();
      await categoryRepo.bulkInsert(categories);
      const categoryIds = categories.map((c) => c.categoryId.id);

      const input = {
        name: 'test',
        categoryIds: categoryIds,
        isActive: false,
      };

      const output = await useCase.execute(input);

      const entity = await genreRepo.findById(new GenreId(output.id));

      expect(output).toStrictEqual({
        id: entity!.genreId.id,
        name: input.name,
        categories: expect.arrayContaining(
          categories.map((e) => ({
            id: e.categoryId.id,
            name: e.name,
            createdAt: e.createdAt,
          })),
        ),
        categoryIds: expect.arrayContaining(categoryIds),
        isActive: input.isActive,
        createdAt: entity!.createdAt,
      });
    });

    it('should rollback transaction when entity is not valid', async () => {
      const categoryId = new CategoryId();
      const input = {
        name: 'test',
        categoryIds: [categoryId.id],
      };

      await expect(() => useCase.execute(input)).rejects.toThrow(
        EntityValidationError,
      );

      const genres = await genreRepo.findAll();
      expect(genres.length).toEqual(0);
    });
  });
});
