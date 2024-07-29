import { FieldsErrors } from './core/shared/domain/validators/validator-fields-interface';

declare global {
  namespace jest {
    interface Matchers<R> {
      notificationContainsErrorMessages: (expected: FieldsErrors) => R;
      toBeValueObject: (expected: ValueObject) => R;
    }
  }
}
