import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';

export type CastMemberOutput = {
  id: string;
  name: string;
  type: number;
  createdAt: Date;
};

export class CastMemberOutputMapper {
  static toOutput(entity: CastMember): CastMemberOutput {
    const { castMemberId, ...otherProps } = entity.toJSON();
    return {
      id: castMemberId,
      ...otherProps,
    };
  }
}
