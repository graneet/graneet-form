import React, {
  FormHTMLAttributes,
  ReactNode,
  useCallback,
} from 'react';
import {
  FieldValues,
  mapValidationStatusesToOutcome,
  VALIDATION_OUTCOME,
} from '../shared';
import { FormContext, FormContextApi } from './contexts/FormContext';

interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: ReactNode,
  form: FormContextApi,
  onSubmit?: (formValues: FieldValues) => void | Promise<void>,
}

/**
 * Context to handle Form. Similar to <form> but using React Context
 * @example
 * ```
 * const form = useForm():
 *
 * return (
 *  <Form form={form}>
 *    <TextField name="foo" />
 *  </Form>
 * )
 * ```
 */
export function Form({
  children,
  form,
  onSubmit,
  ...otherProps
}: FormProps) {
  const {
    getFormValues,
    formInternal: {
      getFormErrorsForNames,
    },
  } = form;

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((event) => {
    event.preventDefault();
    if (onSubmit) {
      const validations = getFormErrorsForNames();
      const isFormValid = mapValidationStatusesToOutcome(validations) === VALIDATION_OUTCOME.VALID;
      if (isFormValid) onSubmit(getFormValues());
    }
  }, [getFormErrorsForNames, getFormValues, onSubmit]);

  return (
    <FormContext.Provider value={form}>
      <form {...otherProps} onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
}
