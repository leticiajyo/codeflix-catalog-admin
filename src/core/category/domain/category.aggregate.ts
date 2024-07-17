import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { ValueObject } from '../../shared/domain/value-object';
import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { CategoryFakeBuilder } from './category-fake.builder';
import { CategoryValidator } from './category.validator';

export type CategoryConstructorProps = {
  categoryId: CategoryId;
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

export class CategoryId extends Uuid {}

export class Category extends AggregateRoot {
  categoryId: CategoryId;
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

    this.validate();
  }

  get entityId(): ValueObject {
    return this.categoryId;
  }

  static create(command: CategoryCreateCommand): Category {
    const props: CategoryConstructorProps = {
      ...command,
      categoryId: new CategoryId(),
      createdAt: new Date(),
      description: command.description ?? null,
      isActive: command.isActive ?? true,
    };

    return new Category(props);
  }

  changeName(name: string): void {
    this.name = name;
    this.validate();
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

  private validate() {
    const validator = new CategoryValidator();
    return validator.validate(this.notification, this);
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
