import { ValueObject } from "../value-object";

class FakeValueObject extends ValueObject {
  constructor(
    readonly prop1: string,
    readonly prop2: number
  ) {
    super();
  }
}

describe("Value Object", () => {
  describe("equals", () => {
    it("should return true if both value objects have the same properties", () => {
      const valueObject1 = new FakeValueObject("test", 1);
      const valueObject2 = new FakeValueObject("test", 1);

      expect(valueObject1.equals(valueObject2)).toBeTruthy();
    });

    it("should return false if at least one property is false", () => {
      const valueObject1 = new FakeValueObject("test", 1);
      const valueObject2 = new FakeValueObject("test", 2);

      expect(valueObject1.equals(valueObject2)).toBeFalsy();
    });
  });
});
