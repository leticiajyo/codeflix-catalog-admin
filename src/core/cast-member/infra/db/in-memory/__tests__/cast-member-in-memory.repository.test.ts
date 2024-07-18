import {
  CastMember,
  CastMemberType,
} from '@core/cast-member/domain/cast-member.aggregate';
import {
  SearchParams,
  SortDirection,
} from '../../../../../shared/domain/repository/search-params';
import { CastMemberInMemoryRepository } from '../cast-member-in-memory.repository';

describe('CastMember In Memory Repository', () => {
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
  });

  describe('search', () => {
    it('should filter items by name', async () => {
      const entity1 = CastMember.fake().oneActor().withName('name').build();
      const entity2 = CastMember.fake().oneActor().withName('NAME').build();
      const entity3 = CastMember.fake().oneActor().withName('other').build();
      repository.items = [entity1, entity2, entity3];

      const searchResult = await repository.search(
        new SearchParams({ filter: { name: 'name' } }),
      );

      expect(searchResult.items).toEqual([entity2, entity1]);
    });

    it('should filter items by type', async () => {
      const entity1 = CastMember.fake()
        .oneActor()
        .withType(CastMemberType.ACTOR)
        .build();
      const entity2 = CastMember.fake()
        .oneActor()
        .withType(CastMemberType.DIRECTOR)
        .build();
      const entity3 = CastMember.fake()
        .oneActor()
        .withType(CastMemberType.DIRECTOR)
        .build();
      repository.items = [entity1, entity2, entity3];

      const searchResult = await repository.search(
        new SearchParams({ filter: { type: CastMemberType.ACTOR } }),
      );

      expect(searchResult.items).toEqual([entity1]);
    });

    it('should filter items by name and type', async () => {
      const entity1 = CastMember.fake()
        .oneActor()
        .withName('name')
        .withType(CastMemberType.ACTOR)
        .build();
      const entity2 = CastMember.fake()
        .oneActor()
        .withName('Name')
        .withType(CastMemberType.DIRECTOR)
        .build();
      const entity3 = CastMember.fake()
        .oneActor()
        .withName('other')
        .withType(CastMemberType.DIRECTOR)
        .build();
      repository.items = [entity1, entity2, entity3];

      const searchResult = await repository.search(
        new SearchParams({
          filter: { name: 'name', type: CastMemberType.DIRECTOR },
        }),
      );

      expect(searchResult.items).toEqual([entity2]);
    });

    it('should sort items based on given params', async () => {
      const entity1 = CastMember.fake().oneActor().withName('name 1').build();
      const entity2 = CastMember.fake().oneActor().withName('name 2').build();
      repository.items = [entity1, entity2];

      const searchResult = await repository.search(
        new SearchParams({ sort: 'name', sortDirection: SortDirection.DESC }),
      );

      expect(searchResult.items).toEqual([entity2, entity1]);
    });

    it('should sort by createdAt when sort param is null', async () => {
      const entity1 = CastMember.fake()
        .oneActor()
        .withName('name 1')
        .withCreatedAt(new Date('2024-06-06T08:00:00'))
        .build();
      const entity2 = CastMember.fake()
        .oneDirector()
        .withName('name 2')
        .withCreatedAt(new Date('2024-07-06T08:00:00'))
        .build();

      repository.items = [entity1, entity2];

      const searchResult = await repository.search(new SearchParams());

      expect(searchResult.items).toEqual([entity2, entity1]);
    });
  });
});
