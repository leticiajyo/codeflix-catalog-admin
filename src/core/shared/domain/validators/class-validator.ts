import { validateSync } from "class-validator";
import { FieldsErrors, IClassValidator } from "./class-validator.interface";

export abstract class ClassValidator<PropsValidated extends object>
  implements IClassValidator<PropsValidated>
{
  errors: FieldsErrors | null = null;

  validate(data: PropsValidated): boolean {
    const errors = validateSync(data);
    if (errors.length) {
      this.errors = {};
      for (const error of errors) {
        const field = error.property;
        this.errors[field] = Object.values(error.constraints!);
      }
    }
    return !errors.length;
  }
}
