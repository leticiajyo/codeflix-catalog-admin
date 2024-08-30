import { GetGenreUseCase } from '../get-genre.use-case';
import { Genre, GenreId } from '../../../../domain/genre.aggregate';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { UnitOfWorkSequelize } from '../../../../../shared/infra/db/sequelize/unit-of-work-sequelize';
import { Category } from '../../../../../category/domain/category.aggregate';
import { GenreSequelizeRepository } from '../../../../infra/db/sequelize/genre-sequelize.repository';
import { CategorySequelizeRepository } from '../../../../../category/infra/db/sequelize/category-sequelize.repository';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../../../infra/db/sequelize/genre.model';
import { CategoryModel } from '../../../../../category/infra/db/sequelize/category.model';
import { setupSequelize } from '@core/shared/infra/testing/sequelize.helper';

describe('Get Genre Use Case', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: GetGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetGenreUseCase(genreRepo, categoryRepo);
  });

  describe('execute', () => {
    it('should throw an error when entity is not found', async () => {
      const genreId = new GenreId();

      await expect(() => useCase.execute({ id: genreId.id })).rejects.toThrow(
        new NotFoundError(genreId.id, Genre),
      );
    });

    it('should return a genre', async () => {
      const categories = Category.fake().manyCategories(2).build();
      await categoryRepo.bulkInsert(categories);

      const genre = Genre.fake()
        .oneGenre()
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .build();
      await genreRepo.insert(genre);

      const output = await useCase.execute({ id: genre.genreId.id });

      expect(output).toStrictEqual({
        id: genre.genreId.id,
        name: genre.name,
        categories: expect.arrayContaining([
          expect.objectContaining({
            id: categories[0].categoryId.id,
            name: categories[0].name,
            createdAt: categories[0].createdAt,
          }),
          expect.objectContaining({
            id: categories[1].categoryId.id,
            name: categories[1].name,
            createdAt: categories[1].createdAt,
          }),
        ]),
        categoryIds: expect.arrayContaining([
          categories[0].categoryId.id,
          categories[1].categoryId.id,
        ]),
        isActive: true,
        createdAt: genre.createdAt,
      });
    });
  });
});
