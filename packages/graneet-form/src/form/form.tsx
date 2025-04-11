import { type FormEventHandler, type FormHTMLAttributes, type ReactNode, useCallback } from 'react';
import type { FieldValues } from '../shared/types/field-value';
import { VALIDATION_OUTCOME } from '../shared/types/validation';
import { mapValidationStatusesToOutcome } from '../shared/util/validation.util';
import { FormContext, type FormContextApi } from './contexts/form-context';

interface FormProps<T extends FieldValues> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: ReactNode;
  form: FormContextApi<T>;
  onSubmit?: () => void;
}

/**
 * Context to handle Form. Similar to <form> but using React Context
 * @example
 * ```tsx
 * const form = useForm():
 *
 * return (
 *  <Form form={form}>
 *    <TextField name="foo" />
 *  </Form>
 * )
 * ```
 */
export function Form<T extends FieldValues>({ children, form, onSubmit, ...otherProps }: FormProps<T>) {
  const {
    getFormValues,
    formInternal: { getFormErrors, getHandleFormSubmit },
  } = form;

  if (onSubmit) {
    onSubmit();
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();

      const validations = getFormErrors();
      const isFormValid = mapValidationStatusesToOutcome<T>(validations) === VALIDATION_OUTCOME.VALID;
      if (isFormValid) {
        const handleFormSubmit = getHandleFormSubmit();

        if (handleFormSubmit) {
          await handleFormSubmit(getFormValues() as T);
        }
      }
    },
    [getFormErrors, getFormValues, getHandleFormSubmit],
  );

  return (
    <FormContext.Provider value={form}>
      <form {...otherProps} onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
}
