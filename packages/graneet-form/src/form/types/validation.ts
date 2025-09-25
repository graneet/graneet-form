import type { FieldValue } from '../../shared/types/field-value';
import type { ValidationState } from '../../shared/types/validation';

export const VALIDATION_STATE_VALID: ValidationState = {
  status: 'valid',
  message: undefined,
};
export const VALIDATION_STATE_UNDETERMINED: ValidationState = {
  status: 'undetermined',
  message: undefined,
};

export type Validator = (value: FieldValue) => boolean | Promise<boolean>;
