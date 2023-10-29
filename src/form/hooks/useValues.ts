import { useEffect, useState } from 'react';
import { FieldValues, Prettify } from '../../shared';
import { FormContextApi } from '../contexts/FormContext';
import { FormValues } from '../types/FormValues';
import { WATCH_MODE } from '../types/WatchMode';

/**
 * Internal hook to handle watch of all field values
 */
function useGlobalValues<T extends FieldValues>(watchMode: WATCH_MODE, form: FormContextApi<T>): Partial<T> {
  const {
    formInternal: { addGlobalValueSubscriber, removeGlobalValueSubscriber },
  } = form;
  const [currentValues, setCurrentValues] = useState<Partial<T>>({});

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
  const [currentValues, setCurrentValues] = useState<FormValues<T, K>>({} as FormValues<T, K>);

  useEffect(() => {
    addValueSubscriber(setCurrentValues, watchMode, names);
    return () => removeValueSubscriber(setCurrentValues, watchMode, names);
    // names is transformed to string to ensure consistant ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addValueSubscriber, names?.join(), removeValueSubscriber, watchMode]);

  return currentValues;
}

/**
 * Watch all registered fields with updates on change
 * @deprecated use `useOnChangeValues(form, undefined)` instead
 * @example
 * ```
 *  const form = useFormContext();
 *   const { foo, bar } = useOnBlurValues(undefined, form);
 *
 *   useEffect(() => {
 *     console.log('"Foo" value has changed for', foo);
 *   }, [foo])
 * ```
 */
export function useOnChangeValues<T extends FieldValues = Record<string, unknown>>(
  names: undefined,
  form: FormContextApi<T>,
): Partial<T>;

/**
 * Watch all registered fields with updates on change
 * @example
 * ```
 *  const form = useFormContext();
 *   const { foo, bar } = useOnBlurValues(form, undefined);
 *
 *   useEffect(() => {
 *     console.log('"Foo" value has changed for', foo);
 *   }, [foo])
 * ```
 */
export function useOnChangeValues<T extends FieldValues = Record<string, unknown>>(
  form: FormContextApi<T>,
  names: undefined,
): Partial<T>;

/**
 * Watch a list of registered fields with updates on change
 * @param names List of watched field names
 * @param form
 * @deprecated use `useOnChangeValues(form, names)` instead
 * @example
 * ```
 *   const form = useFormContext();
 *   const { bar } = useOnBlurValues(['bar'], form);
 *
 *   useEffect(() => {
 *    console.log('"bar" value has changed for', bar);
 *   }, [bar])
 * ```
 */
export function useOnChangeValues<T extends FieldValues = Record<string, unknown>, K extends keyof T = keyof T>(
  names: K[],
  form: FormContextApi<T>,
): Prettify<FormValues<T, K>>;

/**
 * Watch a list of registered fields with updates on change
 * @param form
 * @param names List of watched field names
 * @example
 * ```
 *   const form = useFormContext();
 *   const { bar } = useOnBlurValues(form, ['bar']);
 *
 *   useEffect(() => {
 *    console.log('"bar" value has changed for', bar);
 *   }, [bar])
 * ```
 */
export function useOnChangeValues<T extends FieldValues = Record<string, unknown>, K extends keyof T = keyof T>(
  form: FormContextApi<T>,
  names: K[],
): Prettify<FormValues<T, K>>;

export function useOnChangeValues<T extends FieldValues, K extends keyof T>(
  names: K[] | undefined | FormContextApi<T>,
  form: FormContextApi<T> | K[] | undefined,
) {
  // TODO delete this when form is always the first param
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const internalForm: any = !!names && 'formInternal' in names ? names : form;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const internalNames: any = !!names && 'formInternal' in names ? form : names;

  if (typeof names !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useValues(WATCH_MODE.ON_CHANGE, internalForm, internalNames);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useGlobalValues(WATCH_MODE.ON_CHANGE, internalForm);
}

/**
 * Watch all registered fields with updates on blur
 * @deprecated useOnBlurValues(form, undefined)
 * @example
 * ```
 *  const form = useFormContext();
 *   const { foo, bar } = useOnBlurValues(undefined, form);
 *
 *   useEffect(() => {
 *     console.log('"Foo" value has changed for', foo);
 *   }, [foo])
 * ```
 */
export function useOnBlurValues<T extends FieldValues = Record<string, unknown>>(
  names: undefined,
  form: FormContextApi<T>,
): Partial<T>;

/**
 * Watch all registered fields with updates on blur
 * @example
 * ```
 *  const form = useFormContext();
 *   const { foo, bar } = useOnBlurValues(form, undefined);
 *
 *   useEffect(() => {
 *     console.log('"Foo" value has changed for', foo);
 *   }, [foo])
 * ```
 */
export function useOnBlurValues<T extends FieldValues = Record<string, unknown>>(
  form: FormContextApi<T>,
  names: undefined,
): Partial<T>;

/**
 * Watch a list of registered fields with updates on blur
 * @param names List of watched field names
 * @param form
 * @deprecated useOnBlurValues(form, names)
 * @example
 * ```
 *   const form = useFormContext();
 *   const { bar } = useOnBlurValues(['bar'], form);
 *
 *   useEffect(() => {
 *    console.log('"bar" value has changed for', bar);
 *   }, [bar])
 * ```
 */
export function useOnBlurValues<T extends FieldValues = Record<string, unknown>, K extends keyof T = keyof T>(
  names: K[],
  form: FormContextApi<T>,
): Prettify<FormValues<T, K>>;

/**
 * Watch a list of registered fields with updates on blur
 * @param names List of watched field names
 * @param form
 * @example
 * ```
 *   const form = useFormContext();
 *   const { bar } = useOnBlurValues(['bar'], form);
 *
 *   useEffect(() => {
 *    console.log('"bar" value has changed for', bar);
 *   }, [bar])
 * ```
 */
export function useOnBlurValues<T extends FieldValues = Record<string, unknown>, K extends keyof T = keyof T>(
  form: FormContextApi<T>,
  names: K[],
): Prettify<FormValues<T, K>>;

export function useOnBlurValues<T extends FieldValues, K extends keyof T>(
  names: K[] | undefined | FormContextApi<T>,
  form: FormContextApi<T> | K[] | undefined,
) {
  // TODO delete this when form is always the first param
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const internalForm: any = !!names && 'formInternal' in names ? names : form;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const internalNames: any = !!names && 'formInternal' in names ? form : names;

  if (typeof names !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useValues(WATCH_MODE.ON_BLUR, internalForm, internalNames);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useGlobalValues(WATCH_MODE.ON_BLUR, internalForm);
}
