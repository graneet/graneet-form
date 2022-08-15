import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  FieldValues,
  mapValidationStatusesToOutcome,
  VALIDATION_OUTCOME,
} from '../../shared';
import { useValidations } from './useValidations';
import { FormContextApi } from '../contexts/FormContext';

interface FormStatus {
  formStatus : VALIDATION_OUTCOME,
  isFormValid: boolean,
}

/**
 * Hook to watch form status.
 * @param form (optional) form to use. If it's not given, form context is used.
 */
export function useFormStatus<T extends FieldValues>(form?: FormContextApi<T>): FormStatus {
  const validations = useValidations<T>(undefined, form);
  const [status, setStatus] = useState(VALIDATION_OUTCOME.UNDETERMINED);

  useEffect(() => {
    setStatus(mapValidationStatusesToOutcome(validations));
  }, [validations]);

  return useMemo(() => ({
    formStatus: status,
    isFormValid: status === VALIDATION_OUTCOME.VALID,
  }), [status]);
}
