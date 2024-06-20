import { Entity } from '../../../../domain/entity';
import { NotFoundError } from '../../../../domain/errors/not-found.error';
import { Uuid } from '../../../../domain/value-objects/uuid.vo';
import { InMemoryRepository } from '../in-memory.repository';

class StubEntity extends Entity {
  entityId: Uuid;
  name: string;

  constructor(props: { entityId?: Uuid; name: string }) {
    super();
    this.entityId = props.entityId || new Uuid();
    this.name = props.name;
  }

  toJSON() {
    return {
      entityId: this.entityId.id,
      name: this.name,
    };
  }
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity, Uuid> {
  getEntity(): new (...args: any[]) => StubEntity {
    return StubEntity;
  }
}

describe('In Memory Repository', () => {
  let repository: StubInMemoryRepository;

  beforeEach(() => {
    repository = new StubInMemoryRepository();
  });

  describe('insert', () => {
    it('should insert an entity', async () => {
      const entity = new StubEntity({ name: 'test' });

      await repository.insert(entity);

      expect(repository.items).toHaveLength(1);
      expect(repository.items[0]).toBe(entity);
    });
  });

  describe('bulkInsert', () => {
    it('should bulk insert entities', async () => {
      const entity1 = new StubEntity({ name: 'test' });
      const entity2 = new StubEntity({ name: 'test' });

      await repository.bulkInsert([entity1, entity2]);

      expect(repository.items).toHaveLength(2);
      expect(repository.items[0]).toBe(entity1);
      expect(repository.items[1]).toBe(entity2);
    });
  });

  describe('update', () => {
    it('should update an entity', async () => {
      const entity = new StubEntity({ name: 'test' });

      await repository.insert(entity);

      const updatedEntity = new StubEntity({
        entityId: entity.entityId,
        name: 'updated',
      });

      await repository.update(updatedEntity);

      expect(repository.items[0].toJSON()).toStrictEqual(
        updatedEntity.toJSON(),
      );
    });

    it('should throw an error when entity is not found', async () => {
      const entity = new StubEntity({ name: 'test' });

      await expect(repository.update(entity)).rejects.toThrow(
        new NotFoundError(entity.entityId, StubEntity),
      );
    });
  });

  describe('delete', () => {
    it('should delete an entity', async () => {
      const entity = new StubEntity({ name: 'test' });

      await repository.insert(entity);

      await repository.delete(entity.entityId);

      expect(repository.items).toHaveLength(0);
    });

    it('should throw an error when entity is not found', async () => {
      const entity = new StubEntity({ name: 'test' });

      await expect(repository.delete(entity.entityId)).rejects.toThrow(
        new NotFoundError(entity.entityId, StubEntity),
      );
    });
  });

  describe('findById', () => {
    it('should return retrieved entity', async () => {
      const entity = new StubEntity({ name: 'test' });

      await repository.insert(entity);

      const retrievedEntity = await repository.findById(entity.entityId);

      expect(retrievedEntity!.toJSON()).toStrictEqual(entity.toJSON());
    });

    it('should return null if entity is not found', async () => {
      const retrievedEntity = await repository.findById(new Uuid());

      expect(retrievedEntity).toBeNull;
    });
  });

  describe('findAll', () => {
    it('should return all entities', async () => {
      const entity1 = new StubEntity({ name: 'test' });
      const entity2 = new StubEntity({ name: 'test' });

      await repository.bulkInsert([entity1, entity2]);

      const retrievedEntities = await repository.findAll();

      expect(retrievedEntities).toHaveLength(2);
      expect(retrievedEntities[0].toJSON()).toStrictEqual(entity1.toJSON());
      expect(retrievedEntities[1].toJSON()).toStrictEqual(entity2.toJSON());
    });
  });
});
