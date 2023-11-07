import { useEffect, useState } from 'react';
import { FieldValues, PartialRecord, Prettify, ValidationStatus } from '../../shared';
import { CONTEXT_FORM_DEFAULT, FormContextApi } from '../contexts/FormContext';
import { FormValidations } from '../types/FormValidations';

function useGlobalValidationInternal<T extends FieldValues>(
  form: FormContextApi<T>,
): PartialRecord<keyof T, ValidationStatus | undefined> {
  const {
    formInternal: { addGlobalValidationStatusSubscriber, removeGlobalValidationStatusSubscriber },
  } = form;
  const [currentValidations, setCurrentValidations] = useState<PartialRecord<keyof T, ValidationStatus | undefined>>(
    {},
  );

  if (form === CONTEXT_FORM_DEFAULT) {
    throw new Error('No form context could be found.');
  }

  useEffect(() => {
    addGlobalValidationStatusSubscriber(setCurrentValidations);
    return () => removeGlobalValidationStatusSubscriber(setCurrentValidations);
  }, [addGlobalValidationStatusSubscriber, removeGlobalValidationStatusSubscriber]);

  return currentValidations;
}

function useValidationsInternal<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names: K[],
): Prettify<FormValidations<T, K>> {
  const {
    formInternal: { addValidationStatusSubscriber, removeValidationStatusSubscriber },
  } = form;
  const [currentValidations, setCurrentValidations] = useState<FormValidations<T, K>>({} as FormValidations<T, K>);

  if (form === CONTEXT_FORM_DEFAULT) {
    throw new Error('No form context could be found.');
  }

  useEffect(() => {
    addValidationStatusSubscriber(setCurrentValidations, names);
    return () => removeValidationStatusSubscriber(setCurrentValidations, names);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addValidationStatusSubscriber, names?.join(), removeValidationStatusSubscriber]);

  return currentValidations;
}

/**
 * Watch all registered fields errors
 * @param form
 * @param names undefined
 * @example
 * ```
 *  const { foo, bar } = useValidations(form, undefined);
 *   useEffect(() => {
 *     console.log(foo, bar);
 *   }, [foo, bar])
 * ```
 */
export function useValidations<T extends FieldValues>(
  form: FormContextApi<T>,
  names: undefined,
): PartialRecord<keyof T, ValidationStatus | undefined>;

/**
 * Watch a list of registered fields errors
 * @param form
 * @param names List of watched field names
 * @example
 * ```
 * const { foo } = useValidations(form, ['foo']);
 *   useEffect(() => {
 *     console.log(foo);
 *   }, [foo])
 * ```
 */
export function useValidations<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names: K[],
): FormValidations<T, K>;

export function useValidations<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names: K[] | undefined,
) {
  if (names === undefined) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useGlobalValidationInternal(form);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useValidationsInternal(form, names);
}
