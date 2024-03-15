import type { FieldValues } from '../types/FieldValue';
import type { PartialRecord } from '../types/PartialRecord';
import { VALIDATION_OUTCOME, type ValidationStatus } from '../types/Validation';

export function mapValidationStatusesToOutcome<T extends FieldValues>(
  validationStatuses: PartialRecord<keyof T, ValidationStatus>,
): VALIDATION_OUTCOME {
  let hasInvalid = false;
  let hasUndetermined = false;

  for (const validation of Object.values(validationStatuses)) {
    if (validation?.status === VALIDATION_OUTCOME.UNDETERMINED) {
      hasUndetermined = true;
    } else if (validation?.status === VALIDATION_OUTCOME.INVALID) {
      hasInvalid = true;
    }
  }

  if (hasInvalid) {
    return VALIDATION_OUTCOME.INVALID;
  }
  if (hasUndetermined) {
    return VALIDATION_OUTCOME.UNDETERMINED;
  }
  return VALIDATION_OUTCOME.VALID;
}
