import { Category } from "../category.entity";

describe("Category Validator", () => {
  it("should validate category name", () => {
    expect(() =>
      Category.create({ name: "t".repeat(101) })
    ).containsErrorMessages({
      name: ["name must be shorter than or equal to 100 characters"],
    });
  });
});
