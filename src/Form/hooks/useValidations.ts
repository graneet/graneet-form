import {
  useEffect,
  useState,
} from 'react';
import {
  FieldValue,
} from '../../shared';
import {
  CONTEXT_FORM_DEFAULT,
  FormContextApi,
  FormValidations,
  useFormContext,
} from '../contexts/FormContext';

export function useValidations<T extends Record<string, FieldValue>>(
  names: undefined,
  form?: FormContextApi<T>,
): FormValidations<T, keyof T>
export function useValidations<T extends Record<string, FieldValue>, K extends keyof T>(
  names: K[],
  form?: FormContextApi<T>,
): FormValidations<T, K>

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
export function useValidations<T extends Record<string, FieldValue>, K extends keyof T>(
  names?: K[],
  form?: FormContextApi<T>,
): FormValidations<T, keyof T> | FormValidations<T, K> {
  const formContext = useFormContext<T>();
  const {
    formInternal: {
      addValidationStatusSubscriber,
      removeValidationStatusSubscriber,
    },
  } = form || formContext;
  const [
    currentValidations,
    setCurrentValidations,
  ] = useState<FormValidations<T, keyof T> | FormValidations<T, K>>(
    {} as FormValidations<T, keyof T> | FormValidations<T, K>,
  );

  if (!form && formContext === CONTEXT_FORM_DEFAULT) {
    throw new Error('No form context could be found while calling "useValidations".');
  }

  useEffect(() => {
    addValidationStatusSubscriber<K>(setCurrentValidations, names as K[]);
    return () => removeValidationStatusSubscriber<K>(setCurrentValidations, names as K[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addValidationStatusSubscriber, names?.join(), removeValidationStatusSubscriber]);

  return currentValidations;
}
