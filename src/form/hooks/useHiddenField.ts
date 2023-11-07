import { useMemo } from 'react';
import { FieldValues } from '../../shared';
import { FormContextApi } from '../contexts/FormContext';
import { useOnChangeValues } from './useValues';

export interface UseHiddenField<T extends FieldValues, K extends keyof T> {
  name: K;
  value: T[K] | undefined;
  setValue(newValue: T[K]): void;
}

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
  form: FormContextApi<T>,
  name: K,
): UseHiddenField<T, K> {
  const { [name]: value } = useOnChangeValues(form, [name]);

  return useMemo(
    () => ({
      name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: value as any,
      setValue: (newValue) => {
        const objectValue = { [name]: newValue } as unknown as Partial<T>;
        return form.setFormValues(objectValue);
      },
    }),
    [form, name, value],
  );
}
