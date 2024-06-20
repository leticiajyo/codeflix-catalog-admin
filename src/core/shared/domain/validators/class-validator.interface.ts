import { Notification } from './notification';

export type FieldsErrors = Array<string | { [key: string]: string[] }>;

export interface IClassValidator<PropsValidated> {
  validate(
    notification: Notification,
    data: PropsValidated,
    groups: string[],
  ): boolean;
}
