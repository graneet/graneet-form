import { useMemo } from 'react';
import { FieldValues } from '../../shared';
import { FormContextApi, useFormContext } from '../contexts/FormContext';
import { useOnChangeValues } from './useValues';

export interface UseHiddenField<T extends FieldValues, K extends keyof T> {
  name: K;
  value: T[K] | undefined;
  setValue: (newValue: T[K]) => void;
}

/**
 * Hook to use in association to HiddenField
 * @param name Field name
 * @param form (optional) If not specified, context form is used
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
  form?: FormContextApi<T>,
): UseHiddenField<T, K> {
  const formContext = useFormContext<T>();
  const { setFormValues } = formContext;
  const { [name]: value } = useOnChangeValues<T, K>([name], form || formContext);

  return useMemo(
    () => ({
      name,
      value,
      setValue: (newValue) => {
        const objectValue = { [name]: newValue } as unknown as Partial<T>;
        return form ? form.setFormValues(objectValue) : setFormValues(objectValue);
      },
    }),
    [name, value, form, setFormValues],
  );
}
