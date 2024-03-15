import { useEffect, useState } from 'react';
import type { FieldValues, Prettify } from '../../shared';
import {
  CONTEXT_FORM_DEFAULT,
  type FormContextApi,
} from '../contexts/FormContext';
import type { FormValues } from '../types/FormValues';
import { WATCH_MODE } from '../types/WatchMode';

/**
 * Internal hook to handle watch of all field values
 */
function useGlobalValues<T extends FieldValues>(
  watchMode: WATCH_MODE,
  form: FormContextApi<T>,
): Partial<T> {
  const {
    formInternal: { addGlobalValueSubscriber, removeGlobalValueSubscriber },
  } = form;
  const [currentValues, setCurrentValues] = useState<Partial<T>>({});

  if (form === CONTEXT_FORM_DEFAULT) {
    throw new Error('No form context could be found.');
  }

  useEffect(() => {
    addGlobalValueSubscriber(setCurrentValues, watchMode);
    return () => removeGlobalValueSubscriber(setCurrentValues, watchMode);
  }, [addGlobalValueSubscriber, removeGlobalValueSubscriber, watchMode]);

  return currentValues;
}

/**
 * Internal hook to handle watch for a list of fields
 */
function useValues<T extends FieldValues, K extends keyof T>(
  watchMode: WATCH_MODE,
  form: FormContextApi<T>,
  names: K[],
): FormValues<T, K> {
  const {
    formInternal: { addValueSubscriber, removeValueSubscriber },
  } = form;
  const [currentValues, setCurrentValues] = useState<FormValues<T, K>>(
    {} as FormValues<T, K>,
  );

  if (form === CONTEXT_FORM_DEFAULT) {
    throw new Error('No form context could be found.');
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: `names` is transformed to string to ensure consistant ref
  useEffect(() => {
    addValueSubscriber(setCurrentValues, watchMode, names);
    return () => removeValueSubscriber(setCurrentValues, watchMode, names);
  }, [addValueSubscriber, names?.join(), removeValueSubscriber, watchMode]);

  return currentValues;
}

/**
 * Watch all fields values. Values are updated on change.
 *
 * @example
 * ```tsx
 * interface FormValues {
 *  foo: string
 *  bar: number
 * }
 *
 *  // in your component
 *  const { foo, bar } = useOnChangeValues<FormValues>(form, undefined);
 *   useEffect(() => {
 *     console.log(foo, bar);
 *   }, [foo, bar])
 * ```
 */
export function useOnChangeValues<
  T extends FieldValues = Record<string, unknown>,
>(form: FormContextApi<T>, names: undefined): Partial<T>;

/**
 * Watch a list of fields values. Values are updated on change.
 * Watching a list of fields instead of all fields can be a huge performance improvement.
 *
 * @example
 * ```tsx
 * interface FormValues {
 *  foo: string
 *  bar: number
 * }
 *
 *  // in your component
 *  const { foo } = useOnChangeValues<FormValues>(form, ['foo']);
 *   useEffect(() => {
 *     console.log(foo);
 *   }, [foo, bar])
 * ```
 */
export function useOnChangeValues<
  T extends FieldValues = Record<string, unknown>,
  K extends keyof T = keyof T,
>(form: FormContextApi<T>, names: K[]): Prettify<FormValues<T, K>>;

export function useOnChangeValues<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names: K[] | undefined,
) {
  if (names === undefined) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useGlobalValues(WATCH_MODE.ON_CHANGE, form);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useValues(WATCH_MODE.ON_CHANGE, form, names);
}

/**
 * Watch all fields values. Values are updated on blur.
 *
 * @example
 * ```tsx
 * interface FormValues {
 *  foo: string
 *  bar: number
 * }
 *
 *  // in your component
 *  const { foo, bar } = useOnBlurValues<FormValues>(form, undefined);
 *   useEffect(() => {
 *     console.log(foo, bar);
 *   }, [foo, bar])
 * ```
 */
export function useOnBlurValues<
  T extends FieldValues = Record<string, unknown>,
>(form: FormContextApi<T>, names: undefined): Partial<T>;

/**
 * Watch a list of fields values. Values are updated on blur.
 * Watching a list of fields instead of all fields can be a huge performance improvement.
 *
 * @example
 * ```tsx
 * interface FormValues {
 *  foo: string
 *  bar: number
 * }
 *
 *  // in your component
 *  const { foo } = useOnBlurValues<FormValues>(form, ['foo']);
 *   useEffect(() => {
 *     console.log(foo);
 *   }, [foo, bar])
 * ```
 */
export function useOnBlurValues<
  T extends FieldValues = Record<string, unknown>,
  K extends keyof T = keyof T,
>(form: FormContextApi<T>, names: K[]): Prettify<FormValues<T, K>>;

export function useOnBlurValues<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names: K[] | undefined,
) {
  if (names === undefined) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useGlobalValues(WATCH_MODE.ON_BLUR, form);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useValues(WATCH_MODE.ON_BLUR, form, names);
}
