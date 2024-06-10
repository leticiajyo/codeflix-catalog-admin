import { SortDirection } from "../../../../shared/domain/repository/search-params";
import { Uuid } from "../../../../shared/domain/value-objects/uuid.vo";
import { InMemorySearchableRepository } from "../../../../shared/infra/db/in-memory/in-memory-searchable.repository";
import { Category } from "../../../domain/category.entity";

export class CategoryInMemoryRepository extends InMemorySearchableRepository<
  Category,
  Uuid
> {
  sortableFields: string[] = ["name", "createdAt"];

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }

  protected async applyFilter(
    items: Category[],
    filter: string
  ): Promise<Category[]> {
    if (!filter) {
      return items;
    }

    return items.filter((i) => {
      return i.name.toLowerCase().includes(filter.toLowerCase());
    });
  }

  protected applySort(
    items: Category[],
    sort: string | null,
    sortDirection: SortDirection | null
  ) {
    return sort
      ? super.applySort(items, sort, sortDirection)
      : super.applySort(items, "createdAt", SortDirection.DESC);
  }
}
