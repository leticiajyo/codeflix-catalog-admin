import { MaxLength, IsInt, Max, Min } from 'class-validator';
import { CastMember, CastMemberType } from './cast-member.aggregate';
import { Notification } from '../../shared/domain/validators/notification';
import { ClassValidator } from '@core/shared/domain/validators/class-validator';

export class CastMemberRules {
  @MaxLength(100)
  name: string;

  @IsInt()
  @Min(1)
  @Max(2)
  type: CastMemberType;

  constructor(entity: CastMember) {
    Object.assign(this, entity);
  }
}

export class CastMemberValidator extends ClassValidator<CastMemberRules> {
  validate(
    notification: Notification,
    data: CastMember,
    groups: string[] = [],
  ): boolean {
    return super.validate(notification, new CastMemberRules(data), groups);
  }
}
