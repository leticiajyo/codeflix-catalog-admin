import { Transform } from 'class-transformer';
import {
  ListGenresFilter,
  ListGenresInput,
} from '../../../core/genre/application/use-cases/list-genres/list-genres.input';
import { SortDirection } from '@core/shared/domain/repository/search-params';

export class SearchGenreDto extends ListGenresInput {
  @Transform(({ value }: { value: string }) => parseInt(value))
  page?: number;
  @Transform(({ value }: { value: string }) => parseInt(value))
  perPage?: number;
  sort?: string;
  sortDirection?: SortDirection;
  filter?: ListGenresFilter;
}
