import { useMemo } from 'react';
import { FieldValues } from '../../shared';
import { FormContextApi } from '../contexts/FormContext';
import { useOnChangeValues } from './useValues';

export interface UseHiddenField<T extends FieldValues, K extends keyof T> {
  name: K;
  value: T[K] | undefined;
  setValue(newValue: T[K]): void;
}

export function useHiddenField<T extends FieldValues, K extends keyof T>(
  name: K | FormContextApi<T>,
  form: FormContextApi<T>,
): UseHiddenField<T, K>;

export function useHiddenField<T extends FieldValues, K extends keyof T>(
  name: K,
  form: FormContextApi<T> | K,
): UseHiddenField<T, K>;

export function useHiddenField<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  name: K | FormContextApi<T>,
): UseHiddenField<T, K>;

export function useHiddenField<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T> | K,
  name: K,
): UseHiddenField<T, K>;

/**
 * Hook to use in association to HiddenField
 * @param name Field name
 * @param form
 * @example
 * ```
 * const fooHiddenField = useHiddenField('foo');
 * return <HiddenField {...fooHiddenField} />
 * ```
 */
export function useHiddenField<T extends FieldValues, K extends keyof T>(
  name: K | FormContextApi<T>,
  form: K | FormContextApi<T>,
): UseHiddenField<T, K> {
  // TODO delete this when form is always the first param
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const internalForm: any = !!name && typeof name === 'object' && 'formInternal' in name ? name : form;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const internalName: any = !!name && typeof name === 'object' && 'formInternal' in name ? form : name;

  const { [internalName]: value } = useOnChangeValues(internalForm, [internalName]);

  return useMemo(
    () => ({
      name: internalName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: value as any,
      setValue: (newValue) => {
        const objectValue = { [internalName]: newValue } as unknown as Partial<T>;
        return internalForm.setFormValues(objectValue);
      },
    }),
    [internalName, value, internalForm],
  );
}
