import {
  SearchParams,
  SortDirection,
} from "../../../../shared/domain/repository/search-params";
import { Uuid } from "../../../../shared/domain/value-objects/uuid.vo";
import { Category } from "../../../domain/category.entity";
import { CategoryInMemoryRepository } from "../category-in-memory.repository";

describe("Category In Memory Repository", () => {
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
  });

  describe("search", () => {
    it("should filter items", async () => {
      const entity1 = Category.create({ name: "name" });
      const entity2 = Category.create({ name: "NAME" });
      const entity3 = Category.create({ name: "other" });
      repository.items = [entity1, entity2, entity3];

      const searchResult = await repository.search(
        new SearchParams({ filter: "name" })
      );

      expect(searchResult.items).toEqual([entity2, entity1]);
    });

    it("should sort items based on given params", async () => {
      const entity1 = Category.create({ name: "name 1" });
      const entity2 = Category.create({ name: "name 2" });
      repository.items = [entity1, entity2];

      const searchResult = await repository.search(
        new SearchParams({ sort: "name", sortDirection: SortDirection.DESC })
      );

      expect(searchResult.items).toEqual([entity2, entity1]);
    });

    it("should sort by createdAt when sort param is null", async () => {
      const entity1 = new Category({
        categoryId: new Uuid(),
        name: "name 1",
        description: null,
        isActive: true,
        createdAt: new Date(new Date().getTime() + 100),
      });
      const entity2 = new Category({
        categoryId: new Uuid(),
        name: "name 2",
        description: null,
        isActive: true,
        createdAt: new Date(new Date().getTime() + 200),
      });
      repository.items = [entity1, entity2];

      const searchResult = await repository.search(new SearchParams());

      expect(searchResult.items).toEqual([entity2, entity1]);
    });
  });
});
