import { FieldValues } from '../types/FieldValue';
import { PartialRecord } from '../types/PartialRecord';
import { VALIDATION_OUTCOME, ValidationStatus } from '../types/Validation';

export function mapValidationStatusesToOutcome<T extends FieldValues>(
  validationStatuses: PartialRecord<keyof T, ValidationStatus>,
): VALIDATION_OUTCOME {
  let hasInvalid = false;
  let hasUndetermined = false;

  Object.values(validationStatuses).forEach((validation) => {
    if (validation?.status === VALIDATION_OUTCOME.UNDETERMINED) {
      hasUndetermined = true;
    } else if (validation?.status === VALIDATION_OUTCOME.INVALID) {
      hasInvalid = true;
    }
  });

  if (hasInvalid) {
    return VALIDATION_OUTCOME.INVALID;
  }
  if (hasUndetermined) {
    return VALIDATION_OUTCOME.UNDETERMINED;
  }
  return VALIDATION_OUTCOME.VALID;
}
