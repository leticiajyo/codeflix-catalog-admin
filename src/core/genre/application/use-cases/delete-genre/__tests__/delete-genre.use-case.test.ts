import { DeleteGenreUseCase } from '../delete-genre.use-case';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { Genre, GenreId } from '../../../../domain/genre.aggregate';
import { UnitOfWorkSequelize } from '../../../../../shared/infra/db/sequelize/unit-of-work-sequelize';
import { Category } from '../../../../../category/domain/category.aggregate';
import { GenreSequelizeRepository } from '../../../../infra/db/sequelize/genre-sequelize.repository';
import { CategorySequelizeRepository } from '../../../../../category/infra/db/sequelize/category-sequelize.repository';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../../../infra/db/sequelize/genre-model';
import { CategoryModel } from '../../../../../category/infra/db/sequelize/category.model';
import { setupSequelize } from '@core/shared/infra/testing/sequelize.helper';

describe('Delete Genre Use Case', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: DeleteGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    useCase = new DeleteGenreUseCase(uow, genreRepo);
  });

  describe('execute', () => {
    it('should throw an error when entity is not found', async () => {
      const genreId = new GenreId();

      await expect(() => useCase.execute({ id: genreId.id })).rejects.toThrow(
        new NotFoundError(genreId.id, Genre),
      );
    });

    it('should delete a genre', async () => {
      const categories = Category.fake().manyCategories(2).build();
      await categoryRepo.bulkInsert(categories);

      const genre = Genre.fake()
        .oneGenre()
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .build();
      await genreRepo.insert(genre);

      await useCase.execute({
        id: genre.genreId.id,
      });

      await expect(genreRepo.findById(genre.genreId)).resolves.toBeNull();
    });

    it('should rollback transaction when an error occurs', async () => {
      const categories = Category.fake().manyCategories(2).build();
      await categoryRepo.bulkInsert(categories);

      const genre = Genre.fake()
        .oneGenre()
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .build();
      await genreRepo.insert(genre);

      GenreModel.afterBulkDestroy('hook-test', () => {
        return Promise.reject(new Error('Generic Error'));
      });

      await expect(
        useCase.execute({
          id: genre.genreId.id,
        }),
      ).rejects.toThrow('Generic Error');

      GenreModel.removeHook('afterBulkDestroy', 'hook-test');

      const genres = await genreRepo.findAll();
      expect(genres.length).toEqual(1);
    });
  });
});
