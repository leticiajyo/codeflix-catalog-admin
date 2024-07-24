import { CategoryId } from '../../category/domain/category.aggregate';
import { AggregateRoot } from '../../shared/domain/aggregate-root';
import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { GenreFakeBuilder } from './genre-fake.builder';
import { GenreValidator } from './genre.validator';

export type GenreConstructorProps = {
  genreId?: GenreId;
  name: string;
  categoryIds: Map<string, CategoryId>;
  isActive: boolean;
  createdAt: Date;
};

export type GenreCreateCommand = {
  name: string;
  categoryIds?: CategoryId[];
  isActive?: boolean;
};

export class GenreId extends Uuid {}

export class Genre extends AggregateRoot {
  genreId: GenreId;
  name: string;
  categoryIds: Map<string, CategoryId>;
  isActive: boolean;
  createdAt: Date;

  constructor(props: GenreConstructorProps) {
    super();
    this.genreId = props.genreId;
    this.name = props.name;
    this.categoryIds = props.categoryIds;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;

    this.validate();
  }

  get entityId() {
    return this.genreId;
  }

  static create(command: GenreCreateCommand) {
    const props: GenreConstructorProps = {
      ...command,
      genreId: new GenreId(),
      createdAt: new Date(),
      isActive: command.isActive ?? true,
      categoryIds: command.categoryIds
        ? new Map(
            command.categoryIds.map((categoryId) => [
              categoryId.id,
              categoryId,
            ]),
          )
        : new Map(),
    };

    return new Genre(props);
  }

  changeName(name: string) {
    this.name = name;
    this.validate();
  }

  addCategoryId(categoryId: CategoryId) {
    this.categoryIds.set(categoryId.id, categoryId);
  }

  removeCategoryId(categoryId: CategoryId) {
    this.categoryIds.delete(categoryId.id);
  }

  syncCategoryIds(categoryIds: CategoryId[]) {
    this.categoryIds = new Map(
      categoryIds.map((categoryId) => [categoryId.id, categoryId]),
    );
  }

  activate() {
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }

  private validate() {
    const validator = new GenreValidator();
    return validator.validate(this.notification, this);
  }

  toJSON() {
    return {
      genreId: this.genreId.id,
      name: this.name,
      categoryIds: Array.from(this.categoryIds.values()).map(
        (categoryId) => categoryId.id,
      ),
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }

  static fake() {
    return GenreFakeBuilder;
  }
}
