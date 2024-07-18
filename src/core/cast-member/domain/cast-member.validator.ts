import { MaxLength } from 'class-validator';
import { CastMember } from './cast-member.aggregate';
import { Notification } from '../../shared/domain/validators/notification';
import { ClassValidator } from '@core/shared/domain/validators/class-validator';

export class CastMemberRules {
  @MaxLength(100)
  name!: string;

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
