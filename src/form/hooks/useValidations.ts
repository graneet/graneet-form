import { useEffect, useState } from 'react';
import { FieldValues, PartialRecord, ValidationStatus } from '../../shared';
import { CONTEXT_FORM_DEFAULT, FormContextApi, useFormContext } from '../contexts/FormContext';
import { FormValidations } from '../types/FormValidations';

function useGlobalValidationInternal<T extends FieldValues>(
  form?: FormContextApi<T>,
): PartialRecord<keyof T, ValidationStatus | undefined> {
  const formContext = useFormContext<T>();
  const {
    formInternal: { addGlobalValidationStatusSubscriber, removeGlobalValidationStatusSubscriber },
  } = form || formContext;
  const [currentValidations, setCurrentValidations] = useState<PartialRecord<keyof T, ValidationStatus | undefined>>(
    {},
  );

  if (!form && formContext === CONTEXT_FORM_DEFAULT) {
    throw new Error('No form context could be found.');
  }

  useEffect(() => {
    addGlobalValidationStatusSubscriber(setCurrentValidations);
    return () => removeGlobalValidationStatusSubscriber(setCurrentValidations);
  }, [addGlobalValidationStatusSubscriber, removeGlobalValidationStatusSubscriber]);

  return currentValidations;
}

function useValidationsInternal<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T> | undefined,
  names: K[],
): FormValidations<T, K> {
  const formContext = useFormContext<T>();
  const {
    formInternal: { addValidationStatusSubscriber, removeValidationStatusSubscriber },
  } = form || formContext;
  const [currentValidations, setCurrentValidations] = useState<FormValidations<T, K>>({} as FormValidations<T, K>);

  if (!form && formContext === CONTEXT_FORM_DEFAULT) {
    throw new Error('No form context could be found.');
  }

  useEffect(() => {
    addValidationStatusSubscriber<K>(setCurrentValidations, names);
    return () => removeValidationStatusSubscriber<K>(setCurrentValidations, names);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addValidationStatusSubscriber, names?.join(), removeValidationStatusSubscriber]);

  return currentValidations;
}

/**
 * Watch all registered fields errors
 * @param names undefined
 * @param form You can give a FormContext if the hook is not in `Form`
 * @example
 * ```
 *  const { foo, bar } = useValidations();
 *   useEffect(() => {
 *     console.log(foo, bar);
 *   },[foo, bar])
 * ```
 */
export function useValidations<T extends FieldValues>(
  names: undefined,
  form?: FormContextApi<T>,
): PartialRecord<keyof T, ValidationStatus | undefined>;

/**
 * Watch a list of registered fields errors
 * @param names List of watched field names
 * @param form You can give a FormContext if the hook is not in `Form`
 * @example
 * ```
 * const { foo } = useValidations(['foo']);
 *   useEffect(() => {
 *     console.log(foo);
 *   },[foo])
 * ```
 */
export function useValidations<T extends FieldValues, K extends keyof T>(
  names: K[],
  form?: FormContextApi<T>,
): FormValidations<T, K>;

export function useValidations<T extends FieldValues, K extends keyof T>(names?: K[], form?: FormContextApi<T>) {
  if (names) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useValidationsInternal(form, names);
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useGlobalValidationInternal(form);
}
