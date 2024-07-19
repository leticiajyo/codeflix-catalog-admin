import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@core/shared/application/pagination.output';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { IUseCase } from '../../../../shared/application/use-case.interface';

import {
  ICastMemberRepository,
  CastMemberSearchParams,
  CastMemberSearchResult,
} from '../../../domain/cast-member.repository';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../../common/cast-member.output';
import { CastMemberType } from '@core/cast-member/domain/cast-member.aggregate';

class CastMembersFilter {
  name?: string | null;
  type?: CastMemberType | null;
}

export type ListCastMembersInput = {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDirection?: SortDirection | null;
  filter?: CastMembersFilter | null;
};

export type ListCastMembersOutput = PaginationOutput<CastMemberOutput>;

export class ListCastMembersUseCase
  implements IUseCase<ListCastMembersInput, ListCastMembersOutput>
{
  constructor(private castMemberRepo: ICastMemberRepository) {}

  async execute(input: ListCastMembersInput): Promise<ListCastMembersOutput> {
    const params = new CastMemberSearchParams(input);

    const searchResult = await this.castMemberRepo.search(params);

    return this.toOutput(searchResult);
  }

  private toOutput(
    searchResult: CastMemberSearchResult,
  ): ListCastMembersOutput {
    const { items: _items } = searchResult;
    const items = _items.map((i) => {
      return CastMemberOutputMapper.toOutput(i);
    });
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}
