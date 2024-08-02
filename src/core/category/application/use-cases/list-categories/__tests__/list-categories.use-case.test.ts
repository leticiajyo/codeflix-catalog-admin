import { SortDirection } from '../../../../../shared/domain/repository/search-params';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize.helper';
import { Category } from '../../../../domain/category.aggregate';
import { CategorySequelizeRepository } from '../../../../infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../../infra/db/sequelize/category.model';
import { CategoryOutputMapper } from '../../../common/category.output';
import { ListCategoriesUseCase } from '../list-categories.use-case';

describe('List Categories Use Case', () => {
  let useCase: ListCategoriesUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new ListCategoriesUseCase(repository);
  });

  describe('execute', () => {
    it('should return search result given paginate, sort and filter inputs', async () => {
      const categories = [
        Category.fake().oneCategory().withName('ba').build(),
        Category.fake().oneCategory().withName('AC').build(),
        Category.fake().oneCategory().withName('bc').build(),
        Category.fake().oneCategory().withName('A').build(),
      ];
      await repository.bulkInsert(categories);

      const output = await useCase.execute({
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDirection: SortDirection.ASC,
        filter: 'a',
      });

      expect(output).toEqual({
        items: [categories[3], categories[1]].map(
          CategoryOutputMapper.toOutput,
        ),
        total: 3,
        currentPage: 1,
        perPage: 2,
        lastPage: 2,
      });
    });
  });
});
