import { validateSync } from "class-validator";
import { IClassValidator } from "./class-validator.interface";
import { Notification } from "./notification";

export abstract class ClassValidator<PropsValidated extends object>
  implements IClassValidator<PropsValidated>
{
  validate(
    notification: Notification,
    data: PropsValidated,
    groups: string[]
  ): boolean {
    const errors = validateSync(data, { groups });

    if (errors.length) {
      for (const error of errors) {
        const field = error.property;
        Object.values(error.constraints!).forEach((message) => {
          notification.addError(message, field);
        });
      }
    }
    return !errors.length;
  }
}
