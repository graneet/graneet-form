import React, {
  FormHTMLAttributes,
  ReactNode,
  useCallback,
  FormEventHandler,
} from 'react';
import {
  FieldValue,
  mapValidationStatusesToOutcome,
  VALIDATION_OUTCOME,
} from '../shared';
import { FormContext, FormContextApi } from './contexts/FormContext';

interface FormProps<T extends Record<string, FieldValue>> extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode,
  form: FormContextApi<T>,
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
export function Form<T extends Record<string, FieldValue>>({
  children,
  form,
  ...otherProps
}: FormProps<T>) {
  const {
    getFormValues,
    formInternal: {
      getFormErrorsForNames,
      getHandleFormSubmit,
    },
  } = form;

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async (event) => {
    event.preventDefault();

    const validations = getFormErrorsForNames();
    const isFormValid = mapValidationStatusesToOutcome<T>(validations) === VALIDATION_OUTCOME.VALID;
    if (isFormValid) {
      const handleFormSubmit = getHandleFormSubmit();

      if (handleFormSubmit) {
        await handleFormSubmit(getFormValues());
      }
    }
  }, [getFormErrorsForNames, getFormValues, getHandleFormSubmit]);

  return (
    <FormContext.Provider value={form}>
      <form {...otherProps} onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
}
