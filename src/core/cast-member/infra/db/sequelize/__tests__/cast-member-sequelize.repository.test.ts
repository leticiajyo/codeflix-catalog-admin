import {
  CastMember,
  CastMemberId,
  CastMemberType,
} from '@core/cast-member/domain/cast-member.aggregate';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { SortDirection } from '../../../../../shared/domain/repository/search-params';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize.helper';
import { CastMemberSequelizeRepository } from '../cast-member-sequelize.repository';
import { CastMemberModel } from '../cast-member.model';
import { CastMemberSearchParams } from '@core/cast-member/domain/cast-member.repository';

describe('Cast Member Sequelize Repository', () => {
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(async () => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
  });

  describe('insert', () => {
    it('should insert a new entity', async () => {
      const castMember = CastMember.fake().oneActor().build();

      await repository.insert(castMember);

      const entity = await repository.findById(castMember.castMemberId);
      expect(entity!.toJSON()).toStrictEqual(castMember.toJSON());
    });
  });

  describe('bulkInsert', () => {
    it('should insert new entities', async () => {
      const castMembers = CastMember.fake().manyCastMembers(3).build();

      await repository.bulkInsert(castMembers);

      const entities = await repository.findAll();
      expect(entities).toHaveLength(3);
      entities.forEach((entity) => {
        const castMember = castMembers.find(
          (it) => it.castMemberId.id == entity.castMemberId.id,
        );
        expect(entity!.toJSON()).toStrictEqual(castMember!.toJSON());
      });
    });
  });

  describe('findById', () => {
    it('should return null if entity is not found', async () => {
      const entity = await repository.findById(new CastMemberId());
      expect(entity).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('should return entities for the given ids', async () => {
      const castMembers = CastMember.fake().manyCastMembers(3).build();

      await repository.bulkInsert(castMembers);

      const entities = await repository.findByIds([
        castMembers[0].castMemberId,
        castMembers[1].castMemberId,
      ]);
      expect(entities).toHaveLength(2);
      entities.forEach((entity) => {
        const castMember = castMembers.find(
          (it) => it.castMemberId.id == entity.castMemberId.id,
        );
        expect(entity!.toJSON()).toStrictEqual(castMember!.toJSON());
      });
    });
  });

  describe('existsById', () => {
    it('should return entities separated in existing or not existing', async () => {
      const notExistId = new CastMemberId();
      const castMembers = CastMember.fake().manyCastMembers(3).build();

      await repository.bulkInsert(castMembers);

      const result = await repository.existsById([
        castMembers[0].castMemberId,
        notExistId,
      ]);

      expect(result).toEqual({
        exists: [castMembers[0].castMemberId],
        notExists: [notExistId],
      });
    });
  });

  describe('update', () => {
    it('should update an entity', async () => {
      const castMember = CastMember.fake().oneActor().build();
      await repository.insert(castMember);

      castMember.changeName('updated');
      await repository.update(castMember);

      const entity = await repository.findById(castMember.castMemberId);
      expect(entity!.toJSON()).toStrictEqual(castMember.toJSON());
    });

    it('should throw error when entity is not found', async () => {
      const entity = CastMember.fake().oneActor().build();

      await expect(repository.update(entity)).rejects.toThrow(
        new NotFoundError(entity.castMemberId.id, CastMember),
      );
    });
  });

  describe('delete', () => {
    it('should delete an entity', async () => {
      const castMember = CastMember.fake().oneActor().build();
      await repository.insert(castMember);

      await repository.delete(castMember.castMemberId);

      const entity = await repository.findById(castMember.castMemberId);
      expect(entity).toBeNull();
    });

    it('should throw error when entity is not found', async () => {
      const entity = CastMember.fake().oneActor().build();

      await expect(repository.delete(entity.castMemberId)).rejects.toThrow(
        new NotFoundError(entity.castMemberId.id, CastMember),
      );
    });
  });

  describe('search', () => {
    it('should apply default paginate when search params are null', async () => {
      const castMembers = CastMember.fake().manyCastMembers(16).build();
      await repository.bulkInsert(castMembers);

      const searchOutput = await repository.search(
        new CastMemberSearchParams(),
      );

      expect(searchOutput).toMatchObject({
        total: 16,
        currentPage: 1,
        lastPage: 2,
        perPage: 15,
      });
      expect(searchOutput.items).toHaveLength(15);
    });

    it('should order by createdAt DESC when search params are null', async () => {
      const createdAt = new Date();
      const castMembers = CastMember.fake()
        .manyCastMembers(5)
        .withName((index) => `Name ${index}`)
        .withCreatedAt((index) => new Date(createdAt.getTime() + index))
        .build();
      await repository.bulkInsert(castMembers);

      const searchOutput = await repository.search(
        new CastMemberSearchParams(),
      );

      searchOutput.items.reverse().forEach((_, index) => {
        expect(`Name ${index}`).toBe(`${castMembers[index].name}`);
      });
    });

    it('should apply filter', async () => {
      const castMembers = [
        CastMember.fake()
          .oneActor()
          .withName('test')
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        CastMember.fake()
          .oneActor()
          .withName('a')
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        CastMember.fake()
          .oneActor()
          .withName('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        CastMember.fake()
          .oneDirector()
          .withName('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];
      await repository.bulkInsert(castMembers);

      const searchOutput = await repository.search(
        new CastMemberSearchParams({
          filter: { name: 'test', type: CastMemberType.ACTOR },
        }),
      );

      expect(searchOutput.items).toHaveLength(2);
      expect(searchOutput.total).toBe(2);
    });

    it('should apply sort', async () => {
      expect(repository.sortableFields).toStrictEqual(['name', 'createdAt']);
      const castMembers = [
        CastMember.fake().oneActor().withName('b').build(),
        CastMember.fake().oneActor().withName('a').build(),
        CastMember.fake().oneActor().withName('d').build(),
        CastMember.fake().oneActor().withName('e').build(),
        CastMember.fake().oneActor().withName('c').build(),
      ];
      await repository.bulkInsert(castMembers);

      const searchOutput = await repository.search(
        new CastMemberSearchParams({
          sort: 'name',
          sortDirection: SortDirection.ASC,
        }),
      );

      expect(searchOutput.items).toEqual([
        castMembers[1],
        castMembers[0],
        castMembers[4],
        castMembers[2],
        castMembers[3],
      ]);
    });

    it('should apply paginate, sort and filter', async () => {
      const castMembers = [
        CastMember.fake()
          .oneActor()
          .withName('test')
          .withCreatedAt(new Date(new Date().getTime() + 100))
          .build(),
        CastMember.fake()
          .oneActor()
          .withName('a')
          .withCreatedAt(new Date(new Date().getTime() + 200))
          .build(),
        CastMember.fake()
          .oneActor()
          .withName('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 300))
          .build(),
        CastMember.fake()
          .oneActor()
          .withName('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 400))
          .build(),
        CastMember.fake()
          .oneDirector()
          .withName('test')
          .withCreatedAt(new Date(new Date().getTime() + 500))
          .build(),
        CastMember.fake()
          .oneActor()
          .withName('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 600))
          .build(),
      ];
      await repository.bulkInsert(castMembers);

      const searchOutput = await repository.search(
        new CastMemberSearchParams({
          page: 2,
          perPage: 2,
          sort: 'createdAt',
          sortDirection: SortDirection.ASC,
          filter: { name: 'test', type: CastMemberType.ACTOR },
        }),
      );

      expect(searchOutput).toMatchObject({
        items: [castMembers[3], castMembers[5]],
        total: 4,
        currentPage: 2,
        perPage: 2,
        lastPage: 2,
      });
    });
  });
});
