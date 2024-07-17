import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize.helper';
import { Category, CategoryId } from '../../../../domain/category.aggregate';
import { CategorySequelizeRepository } from '../../../../infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../../infra/db/sequelize/category.model';
import { DeleteCategoryUseCase } from '../delete-category.use-case';

describe('Delete Category Use Case', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new DeleteCategoryUseCase(repository);
  });

  describe('execute', () => {
    it('should throw an error when entity is not found', async () => {
      const categoryId = new CategoryId();

      await expect(() =>
        useCase.execute({ id: categoryId.id }),
      ).rejects.toThrow(new NotFoundError(categoryId.id, Category));
    });

    it('should delete a category', async () => {
      const category = Category.fake().oneCategory().build();
      await repository.insert(category);

      const input = {
        id: category.categoryId.id,
      };

      await useCase.execute(input);

      await expect(
        repository.findById(category.categoryId),
      ).resolves.toBeNull();
    });
  });
});
