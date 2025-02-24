import type { FieldValues } from '../../shared/types/FieldValue';
import type { ValidationStatus } from '../../shared/types/Validation';

export type FormValidations<T extends FieldValues, Keys extends keyof T> = {
  [K in Keys]: ValidationStatus | undefined;
};
