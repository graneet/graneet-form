import { useEffect, useMemo, useState } from 'react';
import type { FieldValues } from '../../shared/types/field-value';
import { VALIDATION_OUTCOME } from '../../shared/types/validation';
import { mapValidationStatusesToOutcome } from '../../shared/util/validation.util';
import type { FormContextApi } from '../contexts/form-context';
import { useValidations } from './use-validations';

interface FormStatus {
  /**
   * The current status of a form's validation outcome.
   */
  formStatus: VALIDATION_OUTCOME;

  /**
   * Indicates whether the form is considered valid or not.
   */
  isValid: boolean;
}

/**
 * Retrieves the status of a form and its validation outcomes
 */
export function useFormStatus<T extends FieldValues>(form: FormContextApi<T>): FormStatus {
  const validations = useValidations(form, undefined);
  const [status, setStatus] = useState(VALIDATION_OUTCOME.UNDETERMINED);

  useEffect(() => {
    setStatus(mapValidationStatusesToOutcome(validations));
  }, [validations]);

  return useMemo(
    () => ({
      formStatus: status,
      isValid: status === VALIDATION_OUTCOME.VALID,
    }),
    [status],
  );
}
