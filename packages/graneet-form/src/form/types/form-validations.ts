import type { FieldValues } from '../../shared/types/field-value';
import type { ValidationState } from '../../shared/types/validation';

export type FormValidations<T extends FieldValues, Keys extends keyof T> = {
  [K in Keys]: ValidationState | undefined;
};
