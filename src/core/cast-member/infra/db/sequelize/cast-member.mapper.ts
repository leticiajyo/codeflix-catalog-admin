import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import { CastMemberModel } from './cast-member.model';

export class CastMemberModelMapper {
  static toModel(entity: CastMember): CastMemberModel {
    return CastMemberModel.build({
      castMemberId: entity.castMemberId.id,
      name: entity.name,
      type: entity.type,
      createdAt: entity.createdAt,
    });
  }

  static toEntity(model: CastMemberModel): CastMember {
    const castMember = new CastMember({
      castMemberId: new CastMemberId(model.castMemberId),
      name: model.name,
      type: model.type,
      createdAt: model.createdAt,
    });

    if (castMember.notification.hasErrors()) {
      throw new LoadEntityError(castMember.notification.toJSON());
    }

    return castMember;
  }
}
