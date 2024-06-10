import { Sequelize } from "sequelize-typescript";
import { CategoryModel } from "../category.model";
import { CategorySequelizeRepository } from "../category-sequelize.repository";
import { Category } from "../../../../domain/category.entity";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";

describe("Category Sequelize Repository", () => {
  let repository: CategorySequelizeRepository;

  beforeEach(async () => {
    const sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      models: [CategoryModel],
      logging: false,
    });
    await sequelize.sync({ force: true });
    repository = new CategorySequelizeRepository(CategoryModel);
  });

  describe("insert", () => {
    it("should insert a new entity", async () => {
      const category = Category.fake().oneCategory().build();

      await repository.insert(category);

      const entity = await repository.findById(category.categoryId);
      expect(entity!.toJSON()).toStrictEqual(category.toJSON());
    });
  });

  describe("bulkInsert", () => {
    it("should insert new entities", async () => {
      const categories = Category.fake().manyCategories(3).build();

      await repository.bulkInsert(categories);

      const entities = await repository.findAll();
      expect(entities).toHaveLength(3);
      entities.forEach((entity) => {
        const category = categories.find(
          (it) => it.categoryId.id == entity.categoryId.id
        );
        expect(entity!.toJSON()).toStrictEqual(category!.toJSON());
      });
    });
  });

  describe("findById", () => {
    it("should return null if entity is not found", async () => {
      const entity = await repository.findById(new Uuid());
      expect(entity).toBeNull();
    });
  });

  describe("update", () => {
    it("should update an entity", async () => {
      const category = Category.fake().oneCategory().build();
      await repository.insert(category);

      category.changeName("updated");
      await repository.update(category);

      const entity = await repository.findById(category.categoryId);
      expect(entity!.toJSON()).toStrictEqual(category.toJSON());
    });

    it("should throw error when entity is not found", async () => {
      const entity = Category.fake().oneCategory().build();

      await expect(repository.update(entity)).rejects.toThrow(
        new NotFoundError(entity.categoryId.id, Category)
      );
    });
  });

  describe("delete", () => {
    it("should delete an entity", async () => {
      const category = Category.fake().oneCategory().build();
      await repository.insert(category);

      await repository.delete(category.categoryId);

      const entity = await repository.findById(category.categoryId);
      expect(entity).toBeNull();
    });

    it("should throw error when entity is not found", async () => {
      const entity = Category.fake().oneCategory().build();

      await expect(repository.delete(entity.categoryId)).rejects.toThrow(
        new NotFoundError(entity.categoryId.id, Category)
      );
    });
  });
});
