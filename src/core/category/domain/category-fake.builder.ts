import { Chance } from 'chance';
import { Category } from './category.entity';
import { Uuid } from '../../shared/domain/value-objects/uuid.vo';

type PropOrFactory<T> = T | ((index: number) => T);

export class CategoryFakeBuilder<T> {
  private _categoryId: PropOrFactory<Uuid> = () => new Uuid();
  private _name: PropOrFactory<string> = () => this.chance.word();
  private _description: PropOrFactory<string | null> = () =>
    this.chance.paragraph();
  private _isActive: PropOrFactory<boolean> = () => true;
  private _createdAt: PropOrFactory<Date> = () => new Date();

  private count;

  static oneCategory() {
    return new CategoryFakeBuilder<Category>();
  }

  static manyCategories(count: number) {
    return new CategoryFakeBuilder<Category[]>(count);
  }

  private chance: Chance.Chance;

  private constructor(count: number = 1) {
    this.count = count;
    this.chance = Chance();
  }

  withUuid(valueOrFactory: PropOrFactory<Uuid>) {
    this._categoryId = valueOrFactory;
    return this;
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  withDescription(valueOrFactory: PropOrFactory<string | null>) {
    this._description = valueOrFactory;
    return this;
  }

  withIsActive(valueOrFactory: PropOrFactory<boolean>) {
    this._isActive = valueOrFactory;
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._createdAt = valueOrFactory;
    return this;
  }

  build(): T {
    const categories = new Array(this.count).fill(undefined).map((_, index) => {
      return new Category({
        categoryId: this.callFactory(this._categoryId, index),
        name: this.callFactory(this._name, index),
        description: this.callFactory(this._description, index),
        isActive: this.callFactory(this._isActive, index),
        createdAt: this.callFactory(this._createdAt, index),
      });
    });
    return this.count === 1 ? (categories[0] as any) : categories;
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    return typeof factoryOrValue === 'function'
      ? factoryOrValue(index)
      : factoryOrValue;
  }
}
