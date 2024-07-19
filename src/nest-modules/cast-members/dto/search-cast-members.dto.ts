import { ListCastMembersInput } from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { CastMemberFilter } from '@core/cast-member/domain/cast-member.repository';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { Transform } from 'class-transformer';

export class SearchCastMembersDto implements ListCastMembersInput {
  @Transform(({ value }: { value: string }) => parseInt(value))
  page?: number;
  @Transform(({ value }: { value: string }) => parseInt(value))
  perPage?: number;
  sort?: string;
  sortDirection?: SortDirection;
  filter?: CastMemberFilter;
}
