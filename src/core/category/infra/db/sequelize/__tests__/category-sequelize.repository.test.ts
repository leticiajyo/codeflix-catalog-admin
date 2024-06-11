import { Sequelize } from "sequelize-typescript";
import { CategoryModel } from "../category.model";
import { CategorySequelizeRepository } from "../category-sequelize.repository";
import { Category } from "../../../../domain/category.entity";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { CategorySearchParams } from "../../../../domain/category.repository";
import { SortDirection } from "../../../../../shared/domain/repository/search-params";

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

  describe("search", () => {
    it("should apply default paginate when search params are null", async () => {
      const categories = Category.fake().manyCategories(16).build();
      await repository.bulkInsert(categories);

      const searchOutput = await repository.search(new CategorySearchParams());

      expect(searchOutput).toMatchObject({
        total: 16,
        currentPage: 1,
        lastPage: 2,
        perPage: 15,
      });
      expect(searchOutput.items).toHaveLength(15);
    });

    it("should order by createdAt DESC when search params are null", async () => {
      const createdAt = new Date();
      const categories = Category.fake()
        .manyCategories(5)
        .withName((index) => `Movie ${index}`)
        .withCreatedAt((index) => new Date(createdAt.getTime() + index))
        .build();
      await repository.bulkInsert(categories);

      const searchOutput = await repository.search(new CategorySearchParams());

      searchOutput.items.reverse().forEach((_, index) => {
        expect(`Movie ${index}`).toBe(`${categories[index].name}`);
      });
    });

    it("should apply filter", async () => {
      const categories = [
        Category.fake()
          .oneCategory()
          .withName("test")
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        Category.fake()
          .oneCategory()
          .withName("a")
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        Category.fake()
          .oneCategory()
          .withName("TEST")
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        Category.fake()
          .oneCategory()
          .withName("TeSt")
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];
      await repository.bulkInsert(categories);

      const searchOutput = await repository.search(
        new CategorySearchParams({
          filter: "test",
        })
      );

      expect(searchOutput.items).toHaveLength(3);
      expect(searchOutput.total).toBe(3);
    });

    it("should apply sort", async () => {
      expect(repository.sortableFields).toStrictEqual(["name", "createdAt"]);

      const categories = [
        Category.fake().oneCategory().withName("b").build(),
        Category.fake().oneCategory().withName("a").build(),
        Category.fake().oneCategory().withName("d").build(),
        Category.fake().oneCategory().withName("e").build(),
        Category.fake().oneCategory().withName("c").build(),
      ];
      await repository.bulkInsert(categories);

      const searchOutput = await repository.search(
        new CategorySearchParams({
          sort: "name",
          sortDirection: SortDirection.ASC,
        })
      );

      expect(searchOutput.items).toEqual([
        categories[1],
        categories[0],
        categories[4],
        categories[2],
        categories[3],
      ]);
    });

    it("should apply paginate, sort and filter", async () => {
      const categories = [
        Category.fake()
          .oneCategory()
          .withName("test")
          .withCreatedAt(new Date(new Date().getTime() + 100))
          .build(),
        Category.fake()
          .oneCategory()
          .withName("a")
          .withCreatedAt(new Date(new Date().getTime() + 200))
          .build(),
        Category.fake()
          .oneCategory()
          .withName("TEST")
          .withCreatedAt(new Date(new Date().getTime() + 300))
          .build(),
        Category.fake()
          .oneCategory()
          .withName("TeSt")
          .withCreatedAt(new Date(new Date().getTime() + 400))
          .build(),
        Category.fake()
          .oneCategory()
          .withName("test")
          .withCreatedAt(new Date(new Date().getTime() + 500))
          .build(),
        Category.fake()
          .oneCategory()
          .withName("TeSt")
          .withCreatedAt(new Date(new Date().getTime() + 600))
          .build(),
      ];
      await repository.bulkInsert(categories);

      const searchOutput = await repository.search(
        new CategorySearchParams({
          page: 2,
          perPage: 2,
          sort: "createdAt",
          sortDirection: SortDirection.ASC,
          filter: "test",
        })
      );

      expect(searchOutput).toMatchObject({
        items: [categories[3], categories[4]],
        total: 5,
        currentPage: 2,
        perPage: 2,
        lastPage: 3,
      });
    });
  });
});
