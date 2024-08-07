import { GenreOutputMapper } from '@core/genre/application/common/genre.output';
import { setupSequelize } from '@core/shared/infra/testing/sequelize.helper';
import { CategorySequelizeRepository } from '../../../../../category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../../../category/infra/db/sequelize/category.model';
import { UnitOfWorkSequelize } from '../../../../../shared/infra/db/sequelize/unit-of-work-sequelize';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../../../infra/db/sequelize/genre-model';
import { GenreSequelizeRepository } from '../../../../infra/db/sequelize/genre-sequelize.repository';
import { ListGenresUseCase } from '../list-genres.use-case';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { SortDirection } from '@core/shared/domain/repository/search-params';

describe('List Genres Use Case', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: ListGenresUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    useCase = new ListGenresUseCase(genreRepo, categoryRepo);
  });

  describe('execute', () => {
    it('should return search result given paginate, sort and filter inputs', async () => {
      const categories = Category.fake().manyCategories(3).build();
      await categoryRepo.bulkInsert(categories);

      const genres = [
        Genre.fake()
          .oneGenre()
          .addCategoryId(categories[0].categoryId)
          .withName('test 1')
          .build(),
        Genre.fake()
          .oneGenre()
          .addCategoryId(categories[0].categoryId)
          .addCategoryId(categories[1].categoryId)
          .withName('test 4')
          .build(),
        Genre.fake()
          .oneGenre()
          .addCategoryId(categories[1].categoryId)
          .withName('test 2')
          .build(),
        Genre.fake()
          .oneGenre()
          .addCategoryId(categories[2].categoryId)
          .withName('e')
          .build(),
        Genre.fake()
          .oneGenre()
          .addCategoryId(categories[2].categoryId)
          .withName('test 3')
          .build(),
      ];
      await genreRepo.bulkInsert(genres);

      const output = await useCase.execute({
        page: 2,
        perPage: 2,
        sort: 'name',
        sortDirection: SortDirection.DESC,
        filter: {
          name: 'TEST',
          categoryIds: [
            categories[0].categoryId.id,
            categories[2].categoryId.id,
          ],
        },
      });

      expect(output).toEqual({
        items: [GenreOutputMapper.toOutput(genres[0], [categories[0]])],
        total: 3,
        currentPage: 2,
        perPage: 2,
        lastPage: 2,
      });
    });

    it('should filter unique category ids before querying the data', async () => {
      const categories = Category.fake().manyCategories(3).build();
      await categoryRepo.bulkInsert(categories);

      const genres = [
        Genre.fake().oneGenre().addCategoryId(categories[0].categoryId).build(),
        Genre.fake().oneGenre().addCategoryId(categories[1].categoryId).build(),
        Genre.fake().oneGenre().addCategoryId(categories[2].categoryId).build(),
        Genre.fake().oneGenre().addCategoryId(categories[2].categoryId).build(),
      ];
      await genreRepo.bulkInsert(genres);

      const spy = jest.spyOn(categoryRepo, 'findByIds');

      await useCase.execute({});

      expect(spy).toHaveBeenCalledWith(
        expect.arrayContaining([
          categories[0].categoryId,
          categories[1].categoryId,
          categories[2].categoryId,
        ]),
      );
    });
  });
});
