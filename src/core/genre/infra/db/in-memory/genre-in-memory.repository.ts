import { Genre, GenreId } from '../../../domain/genre.aggregate';
import {
  IGenreRepository,
  GenreFilter,
} from '../../../domain/genre.repository';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { InMemorySearchableRepository } from '@core/shared/infra/db/in-memory/in-memory-searchable.repository';

export class GenreInMemoryRepository
  extends InMemorySearchableRepository<Genre, GenreId, GenreFilter>
  implements IGenreRepository
{
  sortableFields: string[] = ['name', 'createdAt'];

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }

  protected async applyFilter(
    items: Genre[],
    filter: GenreFilter | null,
  ): Promise<Genre[]> {
    if (!filter) {
      return items;
    }

    return items.filter((genre) => {
      const containsName =
        filter.name &&
        genre.name.toLowerCase().includes(filter.name.toLowerCase());
      const containsCategoriesId =
        filter.categoryIds &&
        filter.categoryIds.some((c) => genre.categoryIds.has(c.id));
      return filter.name && filter.categoryIds
        ? containsName && containsCategoriesId
        : filter.name
          ? containsName
          : containsCategoriesId;
    });
  }

  protected applySort(
    items: Genre[],
    sort: string | null,
    sortDirection: SortDirection | null,
  ): Genre[] {
    return sort
      ? super.applySort(items, sort, sortDirection)
      : super.applySort(items, 'createdAt', SortDirection.DESC);
  }
}
