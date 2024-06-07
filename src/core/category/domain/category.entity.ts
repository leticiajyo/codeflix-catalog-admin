import { Entity } from "../../shared/domain/entity";
import { EntityValidationError } from "../../shared/domain/validators/validation.error";
import { ValueObject } from "../../shared/domain/value-object";
import { Uuid } from "../../shared/domain/value-objects/uuid.vo";
import { CategoryFakeBuilder } from "./category-fake.builder";
import { CategoryValidator } from "./category.validator";

export type CategoryConstructorProps = {
  categoryId: Uuid;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
};

export type CategoryCreateCommand = {
  name: string;
  description?: string;
  isActive?: boolean;
};

export class Category extends Entity {
  categoryId: Uuid;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;

  constructor(props: CategoryConstructorProps) {
    super();
    this.categoryId = props.categoryId;
    this.name = props.name;
    this.description = props.description;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;

    this.validate(this);
  }

  get entityId(): ValueObject {
    return this.categoryId;
  }

  static create(command: CategoryCreateCommand): Category {
    const props: CategoryConstructorProps = {
      categoryId: new Uuid(),
      description: null,
      isActive: true,
      createdAt: new Date(),
      ...command,
    };

    return new Category(props);
  }

  changeName(name: string): void {
    this.name = name;
    this.validate(this);
  }

  changeDescription(description: string): void {
    this.description = description;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  private validate(entity: Category) {
    const validator = new CategoryValidator();
    const isValid = validator.validate(entity);
    if (!isValid) {
      throw new EntityValidationError(validator.errors!);
    }
  }

  toJSON() {
    return {
      categoryId: this.categoryId.id,
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }

  static fake() {
    return CategoryFakeBuilder;
  }
}
