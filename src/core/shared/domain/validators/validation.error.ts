import { FieldsErrors } from "./class-validator.interface";

export class EntityValidationError extends Error {
  constructor(
    public errors: FieldsErrors,
    message = "Entity Validation Error"
  ) {
    super(message);
  }

  count() {
    return Object.keys(this.errors).length;
  }
}
