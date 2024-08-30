import { InMemorySearchableRepository } from '@core/shared/infra/db/in-memory/in-memory-searchable.repository';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import {
  CastMember,
  CastMemberId,
} from '../../../domain/cast-member.aggregate';
import {
  CastMemberFilter,
  ICastMemberRepository,
} from '@core/cast-member/domain/cast-member.repository';

export class CastMemberInMemoryRepository
  extends InMemorySearchableRepository<
    CastMember,
    CastMemberId,
    CastMemberFilter
  >
  implements ICastMemberRepository
{
  sortableFields: string[] = ['name', 'createdAt'];

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }

  protected async applyFilter(
    items: CastMember[],
    filter: CastMemberFilter | null,
  ): Promise<CastMember[]> {
    if (!filter) {
      return items;
    }

    return items.filter((i) => {
      const containsName =
        filter.name && i.name.toLowerCase().includes(filter.name.toLowerCase());
      const hasType = filter.type && i.type == filter.type;
      return filter.name && filter.type
        ? containsName && hasType
        : filter.name
          ? containsName
          : hasType;
    });
  }

  protected applySort(
    items: CastMember[],
    sort: string | null,
    sortDirection: SortDirection | null,
  ): CastMember[] {
    return sort
      ? super.applySort(items, sort, sortDirection)
      : super.applySort(items, 'createdAt', SortDirection.DESC);
  }
}
