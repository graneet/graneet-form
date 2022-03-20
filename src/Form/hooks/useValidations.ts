import {
  useEffect,
  useState,
} from 'react';
import { ValidationStatuses } from '../../shared';
import {
  CONTEXT_FORM_DEFAULT,
  FormContextApi,
  useFormContext,
} from '../contexts/FormContext';

/**
 * Build hook to watch values.
 * If names is not defined, watch all values
 * @param names (optional) Field names
 * @param form (optional) form to use. If it's not given, form context is used.
 * @return
 * ```
 *   const { foo } = useValidations(['foo']);
 *   useEffect(() => {
 *     console.log(foo);
 *   },[])
 * ```
 */
export function useValidations(names?: string[], form?: FormContextApi): ValidationStatuses {
  const formContext = useFormContext();
  const {
    formInternal: {
      addValidationStatusSubscriber,
      removeValidationStatusSubscriber,
    },
  } = form || formContext;
  const [currentValidations, setCurrentValidations] = useState<ValidationStatuses>({});

  if (!form && formContext === CONTEXT_FORM_DEFAULT) {
    throw new Error('No form context could be found while calling "useValidations".');
  }

  useEffect(() => {
    addValidationStatusSubscriber(setCurrentValidations, names);
    return () => removeValidationStatusSubscriber(setCurrentValidations, names);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addValidationStatusSubscriber, names?.join(), removeValidationStatusSubscriber]);

  return currentValidations;
}
