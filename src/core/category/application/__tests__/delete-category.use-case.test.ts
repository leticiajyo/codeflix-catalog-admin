import { NotFoundError } from "../../../shared/domain/errors/not-found.error";
import { Uuid } from "../../../shared/domain/value-objects/uuid.vo";
import { setupSequelize } from "../../../shared/infra/testing/sequelize.helper";
import { Category } from "../../domain/category.entity";
import { CategorySequelizeRepository } from "../../infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "../../infra/db/sequelize/category.model";
import { DeleteCategoryUseCase } from "../delete-category.use-case";

describe("Delete Category Use Case", () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new DeleteCategoryUseCase(repository);
  });

  describe("execute", () => {
    it("should throw an error when entity is not found", async () => {
      const uuid = new Uuid();

      await expect(() => useCase.execute({ id: uuid.id })).rejects.toThrow(
        new NotFoundError(uuid.id, Category)
      );
    });

    it("should delete a category", async () => {
      const category = Category.fake().oneCategory().build();
      await repository.insert(category);

      const input = {
        id: category.categoryId.id,
      };

      await useCase.execute(input);

      await expect(
        repository.findById(category.categoryId)
      ).resolves.toBeNull();
    });
  });
});
