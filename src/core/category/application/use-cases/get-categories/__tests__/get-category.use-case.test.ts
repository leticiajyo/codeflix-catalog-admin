import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize.helper';
import { Category, CategoryId } from '../../../../domain/category.aggregate';
import { CategorySequelizeRepository } from '../../../../infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../../infra/db/sequelize/category.model';
import { GetCategoryUseCase } from '../get-category.use-case';

describe('Get Category Use Case', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetCategoryUseCase(repository);
  });

  describe('execute', () => {
    it('should throw an error when entity is not found', async () => {
      const categoryId = new CategoryId();

      await expect(() =>
        useCase.execute({ id: categoryId.id }),
      ).rejects.toThrow(new NotFoundError(categoryId.id, Category));
    });

    it('should return a category', async () => {
      const category = Category.fake().oneCategory().build();
      await repository.insert(category);

      const output = await useCase.execute({ id: category.categoryId.id });

      expect(output).toStrictEqual({
        id: category.categoryId.id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdAt: category.createdAt,
      });
    });
  });
});
