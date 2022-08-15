import {
  useEffect,
  useState,
} from 'react';
import { FieldValues } from '../../shared';
import {
  CONTEXT_FORM_DEFAULT,
  FormContextApi,
  FormValues,
  useFormContext,
} from '../contexts/FormContext';
import { WATCH_MODE } from '../types/WatchMode';

function useValues<T extends FieldValues, K extends keyof T>(
  watchMode: WATCH_MODE,
  names: K[],
  ): FormValues<T, K>;
function useValues<T extends FieldValues, K extends keyof T>(
  watchMode: WATCH_MODE,
  names: K[],
  form: FormContextApi<T>,
): FormValues<T, K>;

function useValues<T extends FieldValues>(
  watchMode: WATCH_MODE,
): Partial<T>;
function useValues<T extends FieldValues>(
  watchMode: WATCH_MODE,
  names: undefined,
  form: FormContextApi<T>,
): Partial<T>;

/**
 * Hook to watch values.
 * If names is not defined, watch all values
 * @param watchMode OnBlur or OnChange
 * @param names (optional) Field names
 * @param form (optional) form to use. If it's not given, form context is used.
 */
function useValues<T extends FieldValues, K extends keyof T>(
  watchMode: WATCH_MODE,
  names?: K[],
  form?: FormContextApi<T>,
): FormValues<T, K> | Partial<T> {
  const formContext = useFormContext<T>();
  const {
    formInternal: {
      addValueSubscriber,
      removeValueSubscriber,
    },
  } = form || formContext;
  const [currentValues, setCurrentValues] = useState({});

  if (!form && formContext === CONTEXT_FORM_DEFAULT) {
    throw new Error('No form context could be found while calling "useValues".');
  }

  useEffect(() => {
    addValueSubscriber(setCurrentValues, watchMode, names as K[]);
    return () => removeValueSubscriber(setCurrentValues, watchMode, names as K[]);
    // names is transformed to string to ensure consistant ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addValueSubscriber, removeValueSubscriber, watchMode, names?.join()]);

  return currentValues;
}

export function useOnChangeValues<T extends FieldValues, K extends keyof T>(
  names: K[],
  form?: FormContextApi<T>,
): FormValues<T, K>;
export function useOnChangeValues<T extends FieldValues>(): Partial<T>;
export function useOnChangeValues<T extends FieldValues>(
  names: undefined,
  form: FormContextApi<T>,
): Partial<T>;

/**
 * Watch field with updates onChange
 * If `names` is not specified, watch all values
 * @param names (optional) Field names
 * @param form (optional) form to use
 * @return
 * ```
 *   const { foo } = useOnChangeValues(['foo']);
 *   useEffect(() => {
 *     console.log(foo);
 *   },[])
 * ```
 */
export function useOnChangeValues<T extends FieldValues, K extends keyof T>(
  names?: K[],
  form?: FormContextApi<T>,
): FormValues<T, K> | Partial<T> {
  return useValues(
    WATCH_MODE.ON_CHANGE,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    names,
    form,
  );
}

export function useOnBlurValues<T extends FieldValues, K extends keyof T>(
  names: K[],
  form?: FormContextApi<T>,
): FormValues<T, K>;
export function useOnBlurValues<T extends FieldValues>(): Partial<T>;
export function useOnBlurValues<T extends FieldValues>(
  names: undefined,
  form: FormContextApi<T>,
): Partial<T>;

/**
 * Watch field with updates onBlur
 * If `names` is not specified, watch all values
 * @param names (optional) Field names
 * @param form (optional) form to use
 * @return
 * ```
 *   const { foo } = useOnBlurValues(['foo']);
 *   useEffect(() => {
 *     console.log(foo);
 *   },[])
 * ```
 */
export function useOnBlurValues<T extends FieldValues, K extends keyof T>(
  names?: K[],
  form?: FormContextApi<T>,
): FormValues<T, K> | Partial<T> {
  return useValues(
    WATCH_MODE.ON_BLUR,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    names,
    form,
  );
}
