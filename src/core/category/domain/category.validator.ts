import { MaxLength } from 'class-validator';
import { Category } from './category.aggregate';
import { ClassValidator } from '../../shared/domain/validators/class-validator';
import { Notification } from '../../shared/domain/validators/notification';

export class CategoryRules {
  @MaxLength(100)
  name!: string;

  constructor(entity: Category) {
    Object.assign(this, entity);
  }
}

export class CategoryValidator extends ClassValidator<CategoryRules> {
  validate(
    notification: Notification,
    data: Category,
    groups: string[] = [],
  ): boolean {
    return super.validate(notification, new CategoryRules(data), groups);
  }
}
