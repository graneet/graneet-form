import { useEffect, useState } from 'react';
import { FieldValues } from '../../shared';
import { CONTEXT_FORM_DEFAULT, FormContextApi, useFormContext } from '../contexts/FormContext';
import { FormValues } from '../types/FormValues';
import { WATCH_MODE } from '../types/WatchMode';

/**
 * Internal hook to handle watch of all field values
 */
function useGlobalValues<T extends FieldValues>(watchMode: WATCH_MODE, form?: FormContextApi<T>): Partial<T> {
  const formContext = useFormContext<T>();
  const {
    formInternal: { addGlobalValueSubscriber, removeGlobalValueSubscriber },
  } = form || formContext;
  const [currentValues, setCurrentValues] = useState<Partial<T>>({});

  if (!form && formContext === CONTEXT_FORM_DEFAULT) {
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
  form: FormContextApi<T> | undefined,
  names: K[],
): FormValues<T, K> {
  const formContext = useFormContext<T>();
  const {
    formInternal: { addValueSubscriber, removeValueSubscriber },
  } = form || formContext;
  const [currentValues, setCurrentValues] = useState<FormValues<T, K>>({} as FormValues<T, K>);

  if (!form && formContext === CONTEXT_FORM_DEFAULT) {
    throw new Error('No form context could be found');
  }

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
 * @param names
 * @param form You can give a FormContext if the hook is not in `Form`
 * @example
 * ```
 *   const { foo, bar } = useOnBlurValues();
 *
 *   useEffect(() => {
 *     console.log('"Foo" value has changed for', foo);
 *   },[foo])
 * ```
 */
export function useOnChangeValues<T extends FieldValues = Record<string, unknown>>(
  names?: undefined,
  form?: FormContextApi<T>,
): Partial<T>;

/**
 * Watch a list of registered fields with updates on change
 * @param names List of watched field names
 * @param form You can give a FormContext if the hook is not in `Form`
 * @example
 * ```
 *   const { bar } = useOnBlurValues(['bar']);
 *
 *   useEffect(() => {
 *    console.log('"bar" value has changed for', bar);
 *   },[bar])
 * ```
 */
export function useOnChangeValues<T extends FieldValues = Record<string, unknown>, K extends keyof T = keyof T>(
  names: K[],
  form?: FormContextApi<T>,
): FormValues<T, K>;

export function useOnChangeValues(names?: any, form?: any) {
  if (typeof names !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useValues(WATCH_MODE.ON_CHANGE, form, names);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useGlobalValues(WATCH_MODE.ON_CHANGE, form);
}

/**
 * Watch all registered fields with updates on blur
 * @param names
 * @param form You can give a FormContext if the hook is not in `Form`
 * @example
 * ```
 *   const { foo, bar } = useOnBlurValues();
 *
 *   useEffect(() => {
 *     console.log('"Foo" value has changed for', foo);
 *   },[foo])
 * ```
 */
export function useOnBlurValues<T extends FieldValues = Record<string, unknown>>(
  names?: undefined,
  form?: FormContextApi<T>,
): Partial<T>;

/**
 * Watch a list of registered fields with updates on blur
 * @param names List of watched field names
 * @param form You can give a FormContext if the hook is not in `Form`
 * @example
 * ```
 *   const { bar } = useOnBlurValues(['bar']);
 *
 *   useEffect(() => {
 *    console.log('"bar" value has changed for', bar);
 *   },[bar])
 * ```
 */
export function useOnBlurValues<T extends FieldValues = Record<string, unknown>, K extends keyof T = keyof T>(
  names: K[],
  form?: FormContextApi<T>,
): FormValues<T, K>;

export function useOnBlurValues(names?: any, form?: any) {
  if (typeof names !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useValues(WATCH_MODE.ON_BLUR, form, names);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useGlobalValues(WATCH_MODE.ON_BLUR, form);
}
