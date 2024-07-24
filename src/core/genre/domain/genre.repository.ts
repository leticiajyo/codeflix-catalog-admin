import { SearchParams } from '@core/shared/domain/repository/search-params';
import { CategoryId } from '../../category/domain/category.aggregate';
import { SearchResult } from '../../shared/domain/repository/search-result';
import { Genre, GenreId } from './genre.aggregate';
import { ISearchableRepository } from '@core/shared/domain/repository/repository.interface';

export type GenreFilter = {
  name?: string;
  categoryIds?: CategoryId[];
};

export class GenreSearchParams extends SearchParams<GenreFilter> {}

export class GenreSearchResult extends SearchResult<Genre> {}

export interface IGenreRepository
  extends ISearchableRepository<
    Genre,
    GenreId,
    GenreFilter,
    GenreSearchParams,
    GenreSearchResult
  > {}
