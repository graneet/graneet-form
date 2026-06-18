import type { FieldValue } from '../../shared/types/field-value';
import type { ValidationState } from '../../shared/types/validation';

export const VALIDATION_STATE_VALID: ValidationState = {
  message: undefined,
  status: 'valid',
};
export const VALIDATION_STATE_UNDETERMINED: ValidationState = {
  message: undefined,
  status: 'undetermined',
};

export type Validator = (value: FieldValue) => boolean | Promise<boolean>;
