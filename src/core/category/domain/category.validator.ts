import { MaxLength } from "class-validator";
import { Category } from "./category.entity";
import { ClassValidator } from "../../shared/domain/validators/class-validator";

export class CategoryRules {
  @MaxLength(100)
  name!: string;

  constructor({ name }: Category) {
    Object.assign(this, { name });
  }
}

export class CategoryValidator extends ClassValidator<CategoryRules> {
  validate(entity: Category) {
    return super.validate(new CategoryRules(entity));
  }
}
