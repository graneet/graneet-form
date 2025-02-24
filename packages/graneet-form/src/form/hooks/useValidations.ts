import { useEffect, useState } from 'react';
import type { FieldValues } from '../../shared/types/FieldValue';
import type { PartialRecord } from '../../shared/types/PartialRecord';
import type { Prettify } from '../../shared/types/Prettify';
import type { ValidationStatus } from '../../shared/types/Validation';
import { CONTEXT_FORM_DEFAULT, type FormContextApi } from '../contexts/FormContext';
import type { FormValidations } from '../types/FormValidations';

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: names as string to avoid infinite re-render
  useEffect(() => {
    addValidationStatusSubscriber(setCurrentValidations, names);
    return () => removeValidationStatusSubscriber(setCurrentValidations, names);
  }, [addValidationStatusSubscriber, names?.join(), removeValidationStatusSubscriber]);

  return currentValidations;
}

/**
 * Watch all registered fields errors
 *
 * @example
 * ```tsx
 * interface FormValues {
 *  foo: string
 *  bar: number
 * }
 *
 *  // in your component
 *  const { foo, bar } = useValidations<FormValues>(form, undefined);
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
 * Watch a list of fields errors
 *
 * @example
 * ```tsx
 * interface FormValues {
 *  foo: string
 *  bar: number
 * }
 *
 *  // in your component
 *  const { foo } = useValidations<FormValues>(form, [foo]);
 *   useEffect(() => {
 *     console.log(foo);
 *   }, [foo, bar])
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
