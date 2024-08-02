import { SortDirection } from '../../../../shared/domain/repository/search-params';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  validateSync,
} from 'class-validator';

export class ListGenresFilter {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID('4', { each: true })
  @IsArray()
  categoryIds?: string[];
}

export class ListGenresInput {
  page?: number;
  perPage?: number;
  sort?: string;
  sortDirection?: SortDirection;

  @ValidateNested()
  filter?: ListGenresFilter;
}

export class ValidateListGenresInput {
  static validate(input: ListGenresInput) {
    return validateSync(input);
  }
}
