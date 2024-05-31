export type FieldsErrors = {
  [field: string]: string[];
};

export interface IClassValidator<PropsValidated> {
  errors: FieldsErrors | null;
  validate(data: PropsValidated): boolean;
}
