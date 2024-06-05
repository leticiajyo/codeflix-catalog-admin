import { SearchResult } from "../search-result";

describe("Search Result Value Object", () => {
  describe("constructor", () => {
    it("should calculate lastPage when total is a multiple of perPage", () => {
      let searchResult = new SearchResult({
        items: ["entity1", "entity2"] as any,
        total: 4,
        currentPage: 1,
        perPage: 2,
      });

      expect(searchResult.lastPage).toBe(2);
    });

    it("should calculate lastPage when total is not a multiple of perPage", () => {
      let searchResult = new SearchResult({
        items: ["entity1", "entity2"] as any,
        total: 5,
        currentPage: 1,
        perPage: 2,
      });

      expect(searchResult.lastPage).toBe(3);
    });

    it("should set lastPage = 1 when perPage is greater than total", () => {
      let searchResult = new SearchResult({
        items: ["entity1", "entity2"] as any,
        total: 4,
        currentPage: 1,
        perPage: 6,
      });

      expect(searchResult.lastPage).toBe(1);
    });
  });
});
