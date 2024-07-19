import { CastMember, CastMemberType } from '../cast-member.aggregate';

describe('CastMember Validator', () => {
  it('should validate cast member name', () => {
    const castMember = CastMember.create({
      name: 't'.repeat(101),
      type: CastMemberType.ACTOR,
    });

    expect(castMember.notification.hasErrors()).toBe(true);
    expect(castMember.notification).notificationContainsErrorMessages([
      {
        name: ['name must be shorter than or equal to 100 characters'],
      },
    ]);
  });

  it('should validate cast member type', () => {
    const castMember1 = CastMember.create({
      name: 'name',
      type: 0 as CastMemberType,
    });

    expect(castMember1.notification.hasErrors()).toBe(true);
    expect(castMember1.notification).notificationContainsErrorMessages([
      {
        type: ['type must not be less than 1'],
      },
    ]);

    const castMember2 = CastMember.create({
      name: 'name',
      type: 3 as CastMemberType,
    });

    expect(castMember2.notification.hasErrors()).toBe(true);
    expect(castMember2.notification).notificationContainsErrorMessages([
      {
        type: ['type must not be greater than 2'],
      },
    ]);
  });
});
