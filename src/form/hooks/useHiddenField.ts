import { useMemo } from 'react';
import { FieldValues } from '../../shared';
import { FormContextApi } from '../contexts/FormContext';
import { useOnChangeValues } from './useValues';

export interface UseHiddenField<T extends FieldValues, K extends keyof T> {
  name: K;
  value: T[K] | undefined;
  setValue: (newValue: T[K]) => void;
}

/**
 * Hook to use in association to HiddenField
 * @param name Field name
 * @param form
 * @example
 * ```
 * const fooHiddenField = useHiddenField('foo');
 * return (
 *  <HiddenField {...fooHiddenField} />
 * )
 * ```
 */
export function useHiddenField<T extends FieldValues, K extends keyof T>(
  name: K,
  form: FormContextApi<T>,
): UseHiddenField<T, K> {
  const { [name]: value } = useOnChangeValues([name], form);

  return useMemo(
    () => ({
      name,
      value,
      setValue: (newValue) => {
        const objectValue = { [name]: newValue } as unknown as Partial<T>;
        return form.setFormValues(objectValue);
      },
    }),
    [name, value, form],
  );
}
