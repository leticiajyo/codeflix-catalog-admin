import { MaxLength } from 'class-validator';
import { Video } from './video.aggregate';
import { Notification } from '../../shared/domain/validators/notification';
import { ClassValidator } from '@core/shared/domain/validators/class-validator';

export class VideoRules {
  @MaxLength(255)
  title: string;

  constructor(entity: Video) {
    Object.assign(this, entity);
  }
}

export class VideoValidator extends ClassValidator<VideoRules> {
  validate(
    notification: Notification,
    data: Video,
    groups: string[] = [],
  ): boolean {
    return super.validate(notification, new VideoRules(data), groups);
  }
}
