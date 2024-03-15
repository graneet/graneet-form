import { useMemo } from 'react';
import type { FieldValues } from '../../shared';
import type { FormContextApi } from '../contexts/FormContext';
import { useOnChangeValues } from './useValues';

export interface UseHiddenField<T extends FieldValues, K extends keyof T> {
  /**
   * The name of the field.
   */
  name: K;

  /**
   * Field value
   */
  value: T[K] | undefined;

  /**
   * Callback to update hidden field
   * @param newValue
   */
  setValue(newValue: T[K]): void;
}

/**
 * Hook to use in association to HiddenField
 * @example
 * ```tsx
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
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      value: value as any,
      setValue: (newValue) => {
        const objectValue = { [name]: newValue } as unknown as Partial<T>;
        return form.setFormValues(objectValue);
      },
    }),
    [form, name, value],
  );
}
