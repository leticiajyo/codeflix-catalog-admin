import { Chance } from 'chance';
import { Genre, GenreId } from './genre.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';

type PropOrFactory<T> = T | ((index: number) => T);

export class GenreFakeBuilder<T> {
  private _genreId: PropOrFactory<GenreId> = () => new GenreId();
  private _name: PropOrFactory<string> = () => this.chance.word();
  private _categoryIds: PropOrFactory<CategoryId>[] = [];
  private _isActive: PropOrFactory<boolean> = () => true;
  private _createdAt: PropOrFactory<Date> = () => new Date();

  private count;

  static oneGenre() {
    return new GenreFakeBuilder<Genre>();
  }

  static manyGenres(count: number) {
    return new GenreFakeBuilder<Genre[]>(count);
  }

  private chance: Chance.Chance;

  private constructor(count: number = 1) {
    this.count = count;
    this.chance = Chance();
  }

  withGenreId(valueOrFactory: PropOrFactory<GenreId>) {
    this._genreId = valueOrFactory;
    return this;
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  addCategoryId(valueOrFactory: PropOrFactory<CategoryId>) {
    this._categoryIds.push(valueOrFactory);
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
    const genres = new Array(this.count).fill(undefined).map((_, index) => {
      const categoryIds = this._categoryIds.length
        ? this.callFactory(this._categoryIds, index)
        : [new CategoryId()];

      return new Genre({
        genreId: this.callFactory(this._genreId, index),
        name: this.callFactory(this._name, index),
        categoryIds: new Map(categoryIds.map((id) => [id.id, id])),
        isActive: this.callFactory(this._isActive, index),
        createdAt: this.callFactory(this._createdAt, index),
      });
    });
    return this.count === 1 ? (genres[0] as any) : genres;
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    if (typeof factoryOrValue === 'function') {
      return factoryOrValue(index);
    }

    if (factoryOrValue instanceof Array) {
      return factoryOrValue.map((value) => this.callFactory(value, index));
    }

    return factoryOrValue;
  }
}
