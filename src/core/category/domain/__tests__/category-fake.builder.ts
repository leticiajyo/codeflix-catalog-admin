import { Chance } from "chance";
import { CategoryFakeBuilder } from "../category-fake.builder";
import { Uuid } from "../../../shared/domain/value-objects/uuid.vo";

describe("Category Faker Builder", () => {
  describe("oneCategory", () => {
    it("should create category with random values", () => {
      const faker = CategoryFakeBuilder.oneCategory();

      const category = faker.build();

      expect(category.categoryId).toBeInstanceOf(Uuid);
      expect(typeof category.name === "string").toBeTruthy();
      expect(typeof category.description === "string").toBeTruthy();
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    it("should create category with given values", () => {
      const faker = CategoryFakeBuilder.oneCategory();

      const categoryId = new Uuid();
      const name = "name test";
      const description = "description test";
      const isActive = false;
      const createdAt = new Date("2024-06-07T08:00:00");

      const category = faker
        .withUuid(categoryId)
        .withName(name)
        .withDescription(description)
        .withIsActive(isActive)
        .withCreatedAt(createdAt)
        .build();

      expect(category.categoryId).toBe(categoryId);
      expect(category.name).toBe(name);
      expect(category.description).toBe(description);
      expect(category.isActive).toBe(false);
      expect(category.createdAt).toBe(createdAt);
    });
  });

  describe("manyCategories", () => {
    it("should create categories with random values", () => {
      const faker = CategoryFakeBuilder.manyCategories(2);

      const categories = faker.build();

      categories.forEach((category) => {
        expect(category.categoryId).toBeInstanceOf(Uuid);
        expect(typeof category.name === "string").toBeTruthy();
        expect(typeof category.description === "string").toBeTruthy();
        expect(category.isActive).toBe(true);
        expect(category.createdAt).toBeInstanceOf(Date);
      });
    });

    it("should create categories with given factories", () => {
      const count = 2;
      const faker = CategoryFakeBuilder.manyCategories(count);

      const categoryId = new Uuid();
      const name = "name test";
      const description = "description test";
      const isActive = false;
      const createdAt = new Date("2024-06-07T08:00:00");

      const mockUuidFactory = jest.fn(() => categoryId);
      const mockNameFactory = jest.fn(() => name);
      const mockDescriptionFactory = jest.fn(() => description);
      const mockIsActiveFactory = jest.fn(() => isActive);
      const mockCreatedAtFactory = jest.fn(() => createdAt);

      const categories = faker
        .withUuid(mockUuidFactory)
        .withName(mockNameFactory)
        .withDescription(mockDescriptionFactory)
        .withIsActive(mockIsActiveFactory)
        .withCreatedAt(mockCreatedAtFactory)
        .build();

      expect(mockUuidFactory).toHaveBeenCalledTimes(count);
      expect(mockNameFactory).toHaveBeenCalledTimes(count);
      expect(mockDescriptionFactory).toHaveBeenCalledTimes(count);
      expect(mockIsActiveFactory).toHaveBeenCalledTimes(count);
      expect(mockCreatedAtFactory).toHaveBeenCalledTimes(count);

      categories.forEach((category) => {
        expect(category.categoryId).toBe(categoryId);
        expect(category.name).toBe(name);
        expect(category.description).toBe(description);
        expect(category.isActive).toBe(false);
        expect(category.createdAt).toBe(createdAt);
      });
    });
  });
});
