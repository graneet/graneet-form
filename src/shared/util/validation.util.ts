import { VALIDATION_OUTCOME, ValidationStatuses } from '../types/Validation';

export function mapValidationStatusesToOutcome(
  validationStatuses: ValidationStatuses,
): VALIDATION_OUTCOME {
  let hasInvalid = false;
  let hasUndetermined = false;

  Object.values(validationStatuses).forEach((validation) => {
    if (validation.status === VALIDATION_OUTCOME.UNDETERMINED) {
      hasUndetermined = true;
    } else if (validation.status === VALIDATION_OUTCOME.INVALID) {
      hasInvalid = true;
    }
  });

  if (hasInvalid) {
    return VALIDATION_OUTCOME.INVALID;
  } if (hasUndetermined) {
    return VALIDATION_OUTCOME.UNDETERMINED;
  }
  return VALIDATION_OUTCOME.VALID;
}
