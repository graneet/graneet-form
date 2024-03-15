import type { FieldValue } from '../../shared/types/FieldValue';
import { VALIDATION_OUTCOME, type ValidationStatus } from '../../shared/types/Validation';

export const VALIDATION_STATE_VALID: ValidationStatus = {
  status: VALIDATION_OUTCOME.VALID,
  message: undefined,
};
export const VALIDATION_STATE_UNDETERMINED: ValidationStatus = {
  status: VALIDATION_OUTCOME.UNDETERMINED,
  message: undefined,
};

export type Validator = (value: FieldValue) => boolean | Promise<boolean>;
