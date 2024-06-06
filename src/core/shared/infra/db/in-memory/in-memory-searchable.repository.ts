import { Entity } from "../../../domain/entity";
import { ISearchableRepository } from "../../../domain/repository/repository.interface";
import {
  SearchParams,
  SortDirection,
} from "../../../domain/repository/search-params";
import { SearchResult } from "../../../domain/repository/search-result";
import { ValueObject } from "../../../domain/value-object";
import { InMemoryRepository } from "./in-memory.repository";

export abstract class InMemorySearchableRepository<
    E extends Entity,
    EntityId extends ValueObject,
    Filter = string,
  >
  extends InMemoryRepository<E, EntityId>
  implements ISearchableRepository<E, EntityId, Filter>
{
  sortableFields: string[] = [];

  async search(props: SearchParams<Filter>): Promise<SearchResult<E>> {
    const itemsFiltered = await this.applyFilter(this.items, props.filter);
    const itemsSorted = this.applySort(
      itemsFiltered,
      props.sort,
      props.sortDirection
    );
    const itemsPaginated = this.applyPaginate(
      itemsSorted,
      props.page,
      props.perPage
    );

    return new SearchResult({
      items: itemsPaginated,
      total: this.items.length,
      currentPage: props.page,
      perPage: props.perPage,
    });
  }

  protected abstract applyFilter(
    items: E[],
    filter: Filter | null
  ): Promise<E[]>;

  protected applySort(
    items: E[],
    sort: string | null,
    sortDirection: SortDirection | null,
    customGetter?: (sort: string, item: E) => any
  ) {
    if (!sort || !this.sortableFields.includes(sort)) {
      return items;
    }

    return items.sort((a, b) => {
      //@ts-ignore
      const aValue = customGetter ? customGetter(sort, a) : a[sort];
      //@ts-ignore
      const bValue = customGetter ? customGetter(sort, b) : b[sort];
      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });
  }

  protected applyPaginate(
    items: E[],
    page: SearchParams["page"],
    perPage: SearchParams["perPage"]
  ) {
    const start = (page - 1) * perPage;
    const limit = start + perPage;
    return items.slice(start, limit);
  }
}
