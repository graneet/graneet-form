import { useCallback, useSyncExternalStore } from 'react';
import type { FieldValues } from '../../shared/types/FieldValue';
import type { Prettify } from '../../shared/types/Prettify';
import type { FormContextApi } from '../contexts/FormContext';
import type { FormValues } from '../types/FormValues';
import { WATCH_MODE } from '../types/WatchMode';

function useValues<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names: K[] | undefined,
  watchMode: WATCH_MODE,
  // biome-ignore lint/suspicious/noExplicitAny: cannot return a good type :(
): any {
  return useSyncExternalStore(
    // biome-ignore lint/correctness/useExhaustiveDependencies: TODO remove toString
    useCallback(
      (callback) => {
        console.log('ici');
        if (names) {
          form.formInternal.addValueSubscriber(callback, watchMode, names);
        } else {
          form.formInternal.addGlobalValueSubscriber(callback, watchMode);
        }

        return () => {
          if (names) {
            form.formInternal.removeValueSubscriber(callback, watchMode, names);
          } else {
            form.formInternal.removeGlobalValueSubscriber(callback, watchMode);
          }
        };
      },
      [form, names?.toString(), watchMode],
    ),
    // biome-ignore lint/correctness/useExhaustiveDependencies: TODO remove toString
    useCallback(() => {
      // TODO how to deal with immutable
      if (names) {
        return form.formInternal.getFormValuesForNames(names);
      }
      return form.getFormValues();
    }, [form, names?.toString()]),
  );
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
export function useOnChangeValues<T extends FieldValues = Record<string, unknown>>(
  form: FormContextApi<T>,
  names: undefined,
): Partial<T>;

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
export function useOnChangeValues<T extends FieldValues = Record<string, unknown>, K extends keyof T = keyof T>(
  form: FormContextApi<T>,
  names: K[],
): Prettify<FormValues<T, K>>;

export function useOnChangeValues<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names: K[] | undefined,
) {
  return useValues(form, names, WATCH_MODE.ON_CHANGE);
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
export function useOnBlurValues<T extends FieldValues = Record<string, unknown>>(
  form: FormContextApi<T>,
  names: undefined,
): Partial<T>;

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
export function useOnBlurValues<T extends FieldValues = Record<string, unknown>, K extends keyof T = keyof T>(
  form: FormContextApi<T>,
  names: K[],
): Prettify<FormValues<T, K>>;

export function useOnBlurValues<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names: K[] | undefined,
) {
  return useValues(form, names, WATCH_MODE.ON_BLUR);
}
