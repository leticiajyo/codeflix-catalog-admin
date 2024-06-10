import {
  SearchParams,
  SortDirection,
} from "../../../../../shared/domain/repository/search-params";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { Category } from "../../../../domain/category.entity";
import { CategoryInMemoryRepository } from "../category-in-memory.repository";

describe("Category In Memory Repository", () => {
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
  });

  describe("search", () => {
    it("should filter items", async () => {
      const entity1 = Category.fake().oneCategory().withName("name").build();
      const entity2 = Category.fake().oneCategory().withName("NAME").build();
      const entity3 = Category.fake().oneCategory().withName("other").build();
      repository.items = [entity1, entity2, entity3];

      const searchResult = await repository.search(
        new SearchParams({ filter: "name" })
      );

      expect(searchResult.items).toEqual([entity2, entity1]);
    });

    it("should sort items based on given params", async () => {
      const entity1 = Category.fake().oneCategory().withName("name 1").build();
      const entity2 = Category.fake().oneCategory().withName("name 2").build();
      repository.items = [entity1, entity2];

      const searchResult = await repository.search(
        new SearchParams({ sort: "name", sortDirection: SortDirection.DESC })
      );

      expect(searchResult.items).toEqual([entity2, entity1]);
    });

    it("should sort by createdAt when sort param is null", async () => {
      const entity1 = Category.fake()
        .oneCategory()
        .withName("name 1")
        .withCreatedAt(new Date("2024-06-06T08:00:00"))
        .build();
      const entity2 = Category.fake()
        .oneCategory()
        .withName("name 2")
        .withCreatedAt(new Date("2024-07-06T08:00:00"))
        .build();

      repository.items = [entity1, entity2];

      const searchResult = await repository.search(new SearchParams());

      expect(searchResult.items).toEqual([entity2, entity1]);
    });
  });
});
