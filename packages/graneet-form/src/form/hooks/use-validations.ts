import { useEffect, useState } from 'react';
import type { FieldValues } from '../../shared/types/field-value';
import type { PartialRecord } from '../../shared/types/partial-record';
import type { Prettify } from '../../shared/types/prettify';
import type { ValidationStatus } from '../../shared/types/validation';
import type { FormContextApi } from '../contexts/form-context';
import type { FormValidations } from '../types/form-validations';

function useGlobalValidationInternal<T extends FieldValues>(
  form: FormContextApi<T>,
): PartialRecord<keyof T, ValidationStatus | undefined> {
  const {
    formInternal: { addGlobalValidationStatusSubscriber, removeGlobalValidationStatusSubscriber },
  } = form;
  const [currentValidations, setCurrentValidations] = useState<PartialRecord<keyof T, ValidationStatus | undefined>>(
    {},
  );

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
  // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
  const [currentValidations, setCurrentValidations] = useState<FormValidations<T, K>>({} as FormValidations<T, K>);

  // biome-ignore lint/correctness/useExhaustiveDependencies: names as string to avoid infinite re-render
  // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
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
    // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
    return useGlobalValidationInternal(form);
  }

  // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
  return useValidationsInternal(form, names);
}
