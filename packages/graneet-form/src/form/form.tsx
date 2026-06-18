import { useCallback } from 'react';
import type { FormHTMLAttributes, ReactNode, SubmitEventHandler } from 'react';
import type { FieldValues } from '../shared/types/field-value';
import { mapValidationStatusesToOutcome } from '../shared/util/validation.util';
import { FormContext } from './contexts/form-context';
import type { FormContextApi } from './contexts/form-context';

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
export function Form<T extends FieldValues>({ children, form, onSubmit, ...otherProps }: FormProps<T>): ReactNode {
  const {
    getFormValues,
    formInternal: { getFormErrors, getHandleFormSubmit },
  } = form;

  if (onSubmit) {
    onSubmit();
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();

      const validations = getFormErrors();
      const isFormValid = mapValidationStatusesToOutcome<T>(validations) === 'valid';
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
      {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
      <form {...otherProps} onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
}
