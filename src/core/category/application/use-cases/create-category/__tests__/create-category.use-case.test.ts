import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { setupSequelize } from "../../../../../shared/infra/testing/sequelize.helper";
import { CategorySequelizeRepository } from "../../../../infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "../../../../infra/db/sequelize/category.model";
import { CreateCategoryUseCase } from "../create-category.use-case";

describe("Create Category Use Case", () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new CreateCategoryUseCase(repository);
  });

  describe("execute", () => {
    it("should throw an error when entity is not valid", async () => {
      const input = { name: "t".repeat(101) };

      await expect(() => useCase.execute(input)).rejects.toThrow(
        "Entity Validation Error"
      );
    });

    it("should create a category", async () => {
      const input = {
        name: "test",
        description: "some description",
        isActive: false,
      };

      const output = await useCase.execute(input);

      const entity = await repository.findById(new Uuid(output.id));
      expect(entity).toBeDefined();

      expect(output).toStrictEqual({
        id: entity!.categoryId.id,
        name: input.name,
        description: input.description,
        isActive: input.isActive,
        createdAt: entity!.createdAt,
      });
    });
  });
});
