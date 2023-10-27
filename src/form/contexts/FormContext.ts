import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { AnyRecord, FieldValues, ValidationStatus } from '../../shared';
import { WATCH_MODE } from '../types/WatchMode';
import { PartialRecord } from '../../shared/types/PartialRecord';
import { FormValues, FormValidations } from '../types';

export interface FormInternal<T extends FieldValues> {
  /**
   * Return displayed fields values for a list of names.
   * @param names Array of field names
   */
  getFormValuesForNames<K extends keyof T>(names: K[]): FormValues<T, K>;

  /**
   * Return all displayed fields validation statuses.
   */
  getFormErrors(): PartialRecord<keyof T, ValidationStatus>;

  /**
   * Return displayed fields errors for a list of names.
   * @param names Array of field names
   */
  getFormErrorsForNames<K extends keyof T>(names: K[]): Record<K, ValidationStatus | undefined>;

  /**
   * Add new subscriber watching all registered field values.
   * @param publish Callback to publish new value
   * @param type Watch mode
   */
  addGlobalValueSubscriber(publish: Dispatch<SetStateAction<Partial<T>>>, type: WATCH_MODE): void;

  /**
   * Add new subscriber watching a list of field values.
   * @param publish Callback to publish new value
   * @param type Watch mode
   * @param names List of field names watched
   */
  addValueSubscriber<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValues<T, K>>>,
    type: WATCH_MODE,
    names: K[],
  ): void;

  /**
   * Add new subscriber watching all registered field errors.
   * @param publish Callback to publish new value
   */
  addGlobalValidationStatusSubscriber(
    publish: Dispatch<SetStateAction<PartialRecord<keyof T, ValidationStatus | undefined>>>,
  ): void;

  /**
   * Add new subscriber watching a list of field errors.
   * @param publish Callback to publish new value
   * @param names List of field names watched
   */
  addValidationStatusSubscriber<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValidations<T, K>>>,
    names: K[],
  ): void;

  /**
   * Register field in the form state.
   * We cannot have more than one active field for a name.
   * @param name Field name
   * @param setValue Function to change Field value and trigger render
   */
  registerField<K extends keyof T>(name: K, setValue: (value: T[K] | undefined) => void): void;

  /**
   * Unregister a field.
   * Data is still in state after un-registration but field is marked as not displayed.
   * @param name Field name
   */
  unregisterField(name: keyof T): void;

  /**
   * Remove subscriber watching all registered field values.
   * @param publish Callback used to publish new value
   * @param type Watch mode
   */
  removeGlobalValueSubscriber(publish: Dispatch<SetStateAction<Partial<T>>>, type: WATCH_MODE): void;

  /**
   * Remove subscriber watching a list of field values.
   * @param publish Callback used to publish new value
   * @param type Watch mode
   * @param names List of field names watched
   */
  removeValueSubscriber<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValues<T, K>>>,
    type: WATCH_MODE,
    names: K[],
  ): void;

  /**
   * Remove subscriber watching all registered field errors.
   * @param publish Callback used to publish new value
   */
  removeGlobalValidationStatusSubscriber(
    publish: Dispatch<SetStateAction<PartialRecord<keyof T, ValidationStatus | undefined>>>,
  ): void;

  /**
   * Remove validation status subscriber for given fields.
   * @param publish Callback used to publish new value
   * @param names Field names
   */
  removeValidationStatusSubscriber<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValidations<T, K>>>,
    names: K[],
  ): void;

  /**
   * Handle `onChange` action trigger for a field.
   * @param name Field name
   * @param value New value
   * @param hasFocus If the field has user focus
   */
  handleOnChange<K extends keyof T>(name: K, value: T[K] | undefined, hasFocus: boolean): void;

  /**
   * Handle onBlur action trigger for a field.
   * @param name Field name updated
   * @param data Data injected in onUpdateAfterBlur
   */
  handleOnBlur(name: keyof T, data: AnyRecord | undefined): Promise<void>;

  /**
   * Update validation status for a given field.
   * @param name Field name
   * @param validationStatus New status
   */
  updateValidationStatus(name: keyof T, validationStatus: ValidationStatus): void;

  /**
   * Get callback initialized by used than must be run on form submit
   */
  getHandleFormSubmit(): ((formValues: Partial<T>) => void | Promise<void>) | undefined;
}

export interface FormContextApi<T extends FieldValues> {
  /**
   * DO NOT use outside this library. It may have breaking changes in this object in a minor or patch version
   * @internal
   */
  formInternal: FormInternal<T>;

  /**
   * Return all displayed fields values.
   * @example
   * ```
   * const { getFormValues } = useForm();
   * console.log(getFormValues());
   * // {"input1": "value1", "input1": "value1",}
   * ```
   */
  getFormValues(): Partial<T>;

  /**
   * Update form values.
   * @param newValues Record containing new values
   * @param eraseAll If true, reset all values associated to a registered field
   */
  setFormValues(newValues: Partial<T>, eraseAll?: boolean): void;

  /**
   * Reset form value and trigger form rerender.
   * @example
   * ```
   * const { resetForm } = useForm();
   * const handleChange = () => resetForm();
   * ```
   */
  resetForm(): void;

  /**
   * Wrapper to handle form submit
   * @param submitCallback Callback executed when form is sent
   */
  experimental_handleSubmit(submitCallback: (formValues: Partial<T>) => void | Promise<void>): () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FORM_INTERVAL_DEFAULT: FormInternal<any> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFormValuesForNames: () => ({}) as FormValues<any, any>,
  getFormErrors: () => ({}),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getFormErrorsForNames: (): Record<string, ValidationStatus> => ({}),
  addGlobalValueSubscriber: (): void => {},
  addValueSubscriber: (): void => {},
  addGlobalValidationStatusSubscriber: (): void => {},
  addValidationStatusSubscriber: (): void => {},
  registerField: (): void => {},
  unregisterField: (): void => {},
  removeGlobalValueSubscriber: (): void => {},
  removeValueSubscriber: (): void => {},
  removeGlobalValidationStatusSubscriber: (): void => {},
  removeValidationStatusSubscriber: (): void => {},
  handleOnChange: (): void => {},
  handleOnBlur: (): Promise<void> => Promise.resolve(),
  updateValidationStatus: (): void => {},
  getHandleFormSubmit: () => undefined,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CONTEXT_FORM_DEFAULT: FormContextApi<any> = {
  formInternal: FORM_INTERVAL_DEFAULT,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getFormValues: () => ({}),
  setFormValues: () => {},
  resetForm: () => {},
  experimental_handleSubmit: () => () => {},
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormContext = createContext<FormContextApi<any>>(CONTEXT_FORM_DEFAULT);

/**
 * Get React Context for form
 */
export function useFormContext<T extends FieldValues = Record<string, Record<string, unknown>>>(): FormContextApi<T> {
  return useContext(FormContext);
}
