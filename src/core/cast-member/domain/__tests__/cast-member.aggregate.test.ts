import {
  CastMember,
  CastMemberCreateCommand,
  CastMemberId,
  CastMemberType,
} from '../cast-member.aggregate';

describe('Cast Member Aggregate', () => {
  let validateSpy: jest.SpyInstance;

  beforeEach(() => {
    validateSpy = jest.spyOn(CastMember.prototype as any, 'validate');
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should validate entity', () => {
      CastMember.create({ name: 'Anne', type: CastMemberType.ACTOR });

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create cast member with given parameters', () => {
      const command: CastMemberCreateCommand = {
        name: 'Anne',
        type: CastMemberType.ACTOR,
      };

      const castMember = CastMember.create(command);

      expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe(command.name);
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.createdAt).toBeInstanceOf(Date);

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeName', () => {
    it('should change cast member name', () => {
      const castMember = CastMember.create({
        name: 'Anne',
        type: CastMemberType.ACTOR,
      });
      const newName = 'David';

      castMember.changeName(newName);

      expect(castMember.name).toBe(newName);

      expect(validateSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('changeType', () => {
    it('should change cast member type', () => {
      const castMember = CastMember.create({
        name: 'Anne',
        type: CastMemberType.ACTOR,
      });
      const newType = CastMemberType.DIRECTOR;

      castMember.changeType(newType);

      expect(castMember.type).toBe(newType);
    });
  });
});
