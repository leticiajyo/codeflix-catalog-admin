import { MaxLength } from 'class-validator';
import { Genre } from './genre.aggregate';
import { Notification } from '../../shared/domain/validators/notification';
import { ClassValidator } from '@core/shared/domain/validators/class-validator';

export class GenreRules {
  @MaxLength(100)
  name: string;

  constructor(entity: Genre) {
    Object.assign(this, entity);
  }
}

export class GenreValidator extends ClassValidator<GenreRules> {
  validate(
    notification: Notification,
    data: Genre,
    groups: string[] = [],
  ): boolean {
    return super.validate(notification, new GenreRules(data), groups);
  }
}
