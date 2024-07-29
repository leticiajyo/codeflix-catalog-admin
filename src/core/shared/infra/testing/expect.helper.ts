import { ValueObject } from '@core/shared/domain/value-object';
import { FieldsErrors } from '../../domain/validators/class-validator.interface';
import { Notification } from '../../domain/validators/notification';

expect.extend({
  notificationContainsErrorMessages(
    actual: Notification,
    expected: FieldsErrors,
  ) {
    const passedValidation = expected.every((error) => {
      if (typeof error === 'string') {
        return actual.errors.has(error);
      } else {
        return Object.entries(error).every(([field, messages]) => {
          const fieldMessages = actual.errors.get(field) as string[];

          return (
            fieldMessages &&
            fieldMessages.length &&
            fieldMessages.every((message) => messages.includes(message))
          );
        });
      }
    });

    return passedValidation
      ? { pass: true, message: () => '' }
      : {
          pass: false,
          message: () =>
            `The validation errors do not contain ${JSON.stringify(
              expected,
            )}. Current: ${JSON.stringify(actual.toJSON())}`,
        };
  },
  toBeValueObject(expected: ValueObject, received: ValueObject) {
    return expected.equals(received)
      ? { pass: true, message: () => '' }
      : {
          pass: false,
          message: () =>
            `The values object are not equal. Expected: ${JSON.stringify(
              expected,
            )} | Received: ${JSON.stringify(received)}`,
        };
  },
});
