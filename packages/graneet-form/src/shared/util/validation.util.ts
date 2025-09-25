import type { FieldValues } from '../types/field-value';
import type { PartialRecord } from '../types/partial-record';
import type { ValidationState, ValidationStatus } from '../types/validation';

export function mapValidationStatusesToOutcome<T extends FieldValues>(
  validationStatuses: PartialRecord<keyof T, ValidationState>,
): ValidationStatus {
  let hasInvalid = false;
  let hasUndetermined = false;

  for (const validation of Object.values(validationStatuses)) {
    if (validation?.status === 'undetermined') {
      hasUndetermined = true;
    } else if (validation?.status === 'invalid') {
      hasInvalid = true;
    }
  }

  if (hasInvalid) {
    return 'invalid';
  }
  if (hasUndetermined) {
    return 'undetermined';
  }
  return 'valid';
}
