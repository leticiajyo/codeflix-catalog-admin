import { CastMemberFakeBuilder } from '../cast-member-fake.builder';
import { CastMemberId, CastMemberType } from '../cast-member.aggregate';

describe('Cast Member Faker Builder', () => {
  describe('oneActor', () => {
    it('should create actor with random values', () => {
      const faker = CastMemberFakeBuilder.oneActor();

      const castMember = faker.build();

      expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
      expect(typeof castMember.name === 'string').toBeTruthy();
      expect(castMember.type).toEqual(CastMemberType.ACTOR);
      expect(castMember.createdAt).toBeInstanceOf(Date);
    });

    it('should create actor with given values', () => {
      const faker = CastMemberFakeBuilder.oneActor();

      const castMemberId = new CastMemberId();
      const name = 'name test';
      const createdAt = new Date('2024-06-07T08:00:00');

      const castMember = faker
        .withCastMemberId(castMemberId)
        .withName(name)
        .withCreatedAt(createdAt)
        .build();

      expect(castMember.castMemberId).toBe(castMemberId);
      expect(castMember.name).toBe(name);
      expect(castMember.type).toEqual(CastMemberType.ACTOR);
      expect(castMember.createdAt).toBe(createdAt);
    });
  });

  describe('manyActors', () => {
    it('should create actors', () => {
      const faker = CastMemberFakeBuilder.manyActors(2);

      const castMembers = faker.build();

      castMembers.forEach((castMember) => {
        expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
        expect(typeof castMember.name === 'string').toBeTruthy();
        expect(castMember.type).toEqual(CastMemberType.ACTOR);
        expect(castMember.createdAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('oneDirector', () => {
    it('should create director with random values', () => {
      const faker = CastMemberFakeBuilder.oneDirector();

      const castMember = faker.build();

      expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
      expect(typeof castMember.name === 'string').toBeTruthy();
      expect(castMember.type).toEqual(CastMemberType.DIRECTOR);
      expect(castMember.createdAt).toBeInstanceOf(Date);
    });

    it('should create director with given values', () => {
      const faker = CastMemberFakeBuilder.oneDirector();

      const castMemberId = new CastMemberId();
      const name = 'name test';
      const createdAt = new Date('2024-06-07T08:00:00');

      const castMember = faker
        .withCastMemberId(castMemberId)
        .withName(name)
        .withCreatedAt(createdAt)
        .build();

      expect(castMember.castMemberId).toBe(castMemberId);
      expect(castMember.name).toBe(name);
      expect(castMember.type).toEqual(CastMemberType.DIRECTOR);
      expect(castMember.createdAt).toBe(createdAt);
    });
  });

  describe('manyDirectors', () => {
    it('should create directors', () => {
      const faker = CastMemberFakeBuilder.manyDirectors(2);

      const castMembers = faker.build();

      castMembers.forEach((castMember) => {
        expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
        expect(typeof castMember.name === 'string').toBeTruthy();
        expect(castMember.type).toEqual(CastMemberType.DIRECTOR);
        expect(castMember.createdAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('manyCastMembers', () => {
    it('should create cast members with random values', () => {
      const faker = CastMemberFakeBuilder.manyCastMembers(2);

      const castMembers = faker.build();

      castMembers.forEach((castMember) => {
        expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
        expect(typeof castMember.name === 'string').toBeTruthy();
        expect(
          Object.values(CastMemberType).includes(castMember.type),
        ).toBeTruthy();
        expect(castMember.createdAt).toBeInstanceOf(Date);
      });
    });

    it('should create castMembers with given factories', () => {
      const count = 2;
      const faker = CastMemberFakeBuilder.manyCastMembers(count);

      const castMemberId = new CastMemberId();
      const name = 'name test';
      const type = CastMemberType.ACTOR;
      const createdAt = new Date('2024-06-07T08:00:00');

      const mockCastMemberIdFactory = jest.fn(() => castMemberId);
      const mockNameFactory = jest.fn(() => name);
      const mockTypeFactory = jest.fn(() => type);
      const mockCreatedAtFactory = jest.fn(() => createdAt);

      const castMembers = faker
        .withCastMemberId(mockCastMemberIdFactory)
        .withName(mockNameFactory)
        .withType(mockTypeFactory)
        .withCreatedAt(mockCreatedAtFactory)
        .build();

      expect(mockCastMemberIdFactory).toHaveBeenCalledTimes(count);
      expect(mockNameFactory).toHaveBeenCalledTimes(count);
      expect(mockTypeFactory).toHaveBeenCalledTimes(count);
      expect(mockCreatedAtFactory).toHaveBeenCalledTimes(count);

      castMembers.forEach((castMember) => {
        expect(castMember.castMemberId).toBe(castMemberId);
        expect(castMember.name).toBe(name);
        expect(castMember.type).toBe(type);
        expect(castMember.createdAt).toBe(createdAt);
      });
    });
  });
});
