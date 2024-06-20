import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { Uuid } from '../../../../../shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize.helper';
import { Category } from '../../../../domain/category.entity';
import { CategorySequelizeRepository } from '../../../../infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../../infra/db/sequelize/category.model';
import { UpdateCategoryUseCase } from '../../../use-cases/update-category/update-category.use-case';

describe('Update Category Use Case', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new UpdateCategoryUseCase(repository);
  });

  describe('execute', () => {
    it('should throw an error when entity is not found', async () => {
      const uuid = new Uuid();

      await expect(() =>
        useCase.execute({ id: uuid.id, name: 'fake' }),
      ).rejects.toThrow(new NotFoundError(uuid.id, Category));
    });

    it('should throw an error when entity is not valid', async () => {
      const entity = Category.fake().oneCategory().build();
      repository.insert(entity);

      await expect(() =>
        useCase.execute({
          id: entity.categoryId.id,
          name: 't'.repeat(101),
        }),
      ).rejects.toThrow('Entity Validation Error');
    });

    it('should update a category', async () => {
      const entity = Category.fake().oneCategory().build();
      repository.insert(entity);

      const input = {
        id: entity.categoryId.id,
        name: 'test',
        description: 'some description',
        isActive: false,
      };

      const output = await useCase.execute(input);

      expect(output).toStrictEqual({
        id: entity.categoryId.id,
        name: input.name,
        description: input.description,
        isActive: input.isActive,
        createdAt: entity.createdAt,
      });
    });
  });
});
