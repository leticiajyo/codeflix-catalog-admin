import { ListCategoriesInput } from '@core/category/application/use-cases/list-categories/list-categories.use-case';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { Transform } from 'class-transformer';

export class SearchCategoriesDto implements ListCategoriesInput {
  @Transform(({ value }: { value: string }) => parseInt(value))
  page?: number;
  @Transform(({ value }: { value: string }) => parseInt(value))
  perPage?: number;
  sort?: string;
  sortDirection?: SortDirection;
  filter?: string;
}
