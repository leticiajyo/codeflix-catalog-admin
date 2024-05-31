import { ClassValidator } from "../../domain/validators/class-validator";
import { FieldsErrors } from "../../domain/validators/class-validator.interface";
import { EntityValidationError } from "../../domain/validators/validation.error";

type Expected =
  | {
      validator: ClassValidator<any>;
      data: any;
    }
  | (() => any);

expect.extend({
  containsErrorMessages(expected: Expected, received: FieldsErrors) {
    if (typeof expected === "function") {
      try {
        expected();
        return invalidResponse();
      } catch (e) {
        const error = e as EntityValidationError;
        return assertContainsErrorsMessages(error.errors, received);
      }
    } else {
      const { validator, data } = expected;
      const isValid = validator.validate(data);

      if (isValid) {
        return invalidResponse();
      }

      return assertContainsErrorsMessages(validator.errors!, received);
    }
  },
});

function assertContainsErrorsMessages(
  expected: FieldsErrors,
  received: FieldsErrors
) {
  const isMatch = expect.objectContaining(received).asymmetricMatch(expected);

  return isMatch
    ? { pass: true, message: () => "" }
    : {
        pass: false,
        message: () =>
          `The validation errors do not contain ${JSON.stringify(
            received
          )}. Current: ${JSON.stringify(expected)}`,
      };
}

function invalidResponse() {
  return {
    pass: false,
    message: () => "An error was expected but none was thrown",
  };
}
