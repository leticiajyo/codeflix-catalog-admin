import { Entity } from '../../../../domain/entity';
import {
  SearchParams,
  SortDirection,
} from '../../../../domain/repository/search-params';
import { Uuid } from '../../../../domain/value-objects/uuid.vo';
import { InMemorySearchableRepository } from '../in-memory-searchable.repository';

class StubEntity extends Entity {
  entityId: Uuid;
  name: string;

  constructor(props: { entityId?: Uuid; name: string }) {
    super();
    this.entityId = props.entityId ?? new Uuid();
    this.name = props.name;
  }

  toJSON() {
    return {
      id: this.entityId.id,
      name: this.name,
    };
  }
}

class StubInMemorySearchableRepository extends InMemorySearchableRepository<
  StubEntity,
  Uuid
> {
  sortableFields: string[] = ['name'];

  getEntity(): new (...args: any[]) => StubEntity {
    return StubEntity;
  }

  protected async applyFilter(
    items: StubEntity[],
    filter: string | null,
  ): Promise<StubEntity[]> {
    if (!filter) {
      return items;
    }

    return items.filter((i) => {
      return i.name.toLowerCase().includes(filter.toLowerCase());
    });
  }
}

describe('In Memory Searchable Repository', () => {
  let repository: StubInMemorySearchableRepository;

  beforeEach(() => {
    repository = new StubInMemorySearchableRepository();
  });

  describe('search', () => {
    it('should search with default params if none were specified', async () => {
      const items = [
        new StubEntity({ name: 'name 2' }),
        new StubEntity({ name: 'name 1' }),
      ];
      repository.items = items;

      const searchResult = await repository.search(new SearchParams());

      expect(searchResult).toEqual({
        currentPage: 1,
        items,
        lastPage: 1,
        perPage: 15,
        total: 2,
      });
    });

    it('should filter items', async () => {
      const entity1 = new StubEntity({ name: 'name' });
      const entity2 = new StubEntity({ name: 'NAME' });
      const entity3 = new StubEntity({ name: 'other' });
      repository.items = [entity1, entity2, entity3];

      const searchResult = await repository.search(
        new SearchParams({ filter: 'name' }),
      );

      expect(searchResult.items).toEqual([entity1, entity2]);
    });

    it('should sort items in ascending order', async () => {
      const entity1 = new StubEntity({ name: 'name 1' });
      const entity2 = new StubEntity({ name: 'name 2' });
      repository.items = [entity2, entity1];

      const searchResult = await repository.search(
        new SearchParams({ sort: 'name', sortDirection: SortDirection.ASC }),
      );

      expect(searchResult.items).toEqual([entity1, entity2]);
    });

    it('should sort items in descending order', async () => {
      const entity1 = new StubEntity({ name: 'name 1' });
      const entity2 = new StubEntity({ name: 'name 2' });
      repository.items = [entity1, entity2];

      const searchResult = await repository.search(
        new SearchParams({ sort: 'name', sortDirection: SortDirection.DESC }),
      );

      expect(searchResult.items).toEqual([entity2, entity1]);
    });

    it('should paginate items', async () => {
      const entity1 = new StubEntity({ name: 'name 1' });
      const entity2 = new StubEntity({ name: 'name 2' });
      const entity3 = new StubEntity({ name: 'name 3' });
      const entity4 = new StubEntity({ name: 'name 4' });
      const entity5 = new StubEntity({ name: 'name 5' });
      repository.items = [entity1, entity2, entity3, entity4, entity5];

      const searchResult = await repository.search(
        new SearchParams({ page: 2, perPage: 2 }),
      );

      expect(searchResult).toEqual({
        currentPage: 2,
        items: [entity3, entity4],
        lastPage: 3,
        perPage: 2,
        total: 5,
      });
    });
  });
});
