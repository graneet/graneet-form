import { useMemo } from 'react';
import { FieldValue } from '../../shared';
import { FormContextApi, useFormContext } from '../contexts/FormContext';
import { useOnChangeValues } from './useValues';

interface UseHiddenField {
  name: string,
  value: FieldValue,
  setValue: (newValue: FieldValue) => void,
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
export function useHiddenField(name: string, form?: FormContextApi): UseHiddenField {
  const { setFormValues } = useFormContext();
  const { [name]: value } = useOnChangeValues([name], form);

  return useMemo(() => ({
    name,
    value,
    setValue: (newValue) => (
      form
        ? form.setFormValues({ [name]: newValue })
        : setFormValues({ [name]: newValue })
    ),
  }), [name, value, form, setFormValues]);
}
