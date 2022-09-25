import { FieldValues, ValidationStatus } from '../../shared';

export type FormValidations<T extends FieldValues, Keys extends keyof T> = {
  [K in Keys]: ValidationStatus | undefined;
};
