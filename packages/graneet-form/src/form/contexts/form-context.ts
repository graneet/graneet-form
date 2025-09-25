import { createContext, type Dispatch, type SetStateAction, use } from 'react';
import type { AnyRecord } from '../../shared/types/any-record';
import type { FieldValues } from '../../shared/types/field-value';
import type { PartialRecord } from '../../shared/types/partial-record';
import type { ValidationStatus } from '../../shared/types/validation';
import type { FormValidations } from '../types/form-validations';
import type { FormValues } from '../types/form-values';
import type { WATCH_MODE } from '../types/watch-mode';

/**
 * Internal API for form implementation details.
 *
 * **⚠️ WARNING: DO NOT use outside this library.**
 * This interface may have breaking changes in minor or patch versions.
 *
 * @internal
 * @template T - The form field values type
 */
export interface FormInternal<T extends FieldValues> {
  /**
   * Retrieves form values for specific field names.
   * @param names - Array of field names to get values for
   * @returns Object containing values for the specified fields
   * @example
   * ```ts
   * const values = getFormValuesForNames(['name', 'email']);
   * // Returns: { name: 'John', email: 'john@example.com' }
   * ```
   */
  getFormValuesForNames<K extends keyof T>(names: K[]): FormValues<T, K>;

  /**
   * Retrieves validation statuses for all registered form fields.
   * @returns Object mapping field names to their validation status
   * @example
   * ```ts
   * const errors = getFormErrors();
   * // Returns: { name: { status: 'VALID', message: undefined }, email: { status: 'INVALID', message: 'Required' } }
   * ```
   */
  getFormErrors(): PartialRecord<keyof T, ValidationStatus>;

  /**
   * Retrieves validation statuses for specific field names.
   * @param names - Array of field names to get validation statuses for
   * @returns Object containing validation statuses for the specified fields
   */
  getFormErrorsForNames<K extends keyof T>(names: K[]): Record<K, ValidationStatus | undefined>;

  /**
   * Registers a subscriber to watch changes in all form field values.
   * @param publish - React state setter callback to update with new values
   * @param type - Watch mode determining when updates are triggered
   */
  addGlobalValueSubscriber(publish: Dispatch<SetStateAction<Partial<T>>>, type: WATCH_MODE): void;

  /**
   * Registers a subscriber to watch changes in specific form field values.
   * @param publish - React state setter callback to update with new values
   * @param type - Watch mode determining when updates are triggered
   * @param names - Array of field names to watch
   */
  addValueSubscriber<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValues<T, K>>>,
    type: WATCH_MODE,
    names: K[],
  ): void;

  /**
   * Registers a subscriber to watch validation status changes for all fields.
   * @param publish - React state setter callback to update with new validation statuses
   */
  addGlobalValidationStatusSubscriber(
    publish: Dispatch<SetStateAction<PartialRecord<keyof T, ValidationStatus | undefined>>>,
  ): void;

  /**
   * Registers a subscriber to watch validation status changes for specific fields.
   * @param publish - React state setter callback to update with new validation statuses
   * @param names - Array of field names to watch for validation changes
   */
  addValidationStatusSubscriber<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValidations<T, K>>>,
    names: K[],
  ): void;

  /**
   * Registers a field in the form state management system.
   *
   * **Note:** Only one active field per name is allowed at a time.
   *
   * @param name - Unique field name identifier
   * @param setValue - Function to update the field value and trigger re-renders
   * @param defaultValue - Optional default value for the field
   * @returns Cleanup function to unregister the field
   */
  registerField<K extends keyof T>(
    name: K,
    setValue: (value: T[K] | undefined) => void,
    defaultValue?: T[K],
  ): () => void;

  /**
   * Removes a subscriber that was watching all form field values.
   * @param publish - The same callback function that was used to register
   * @param type - The same watch mode that was used to register
   */
  removeGlobalValueSubscriber(publish: Dispatch<SetStateAction<Partial<T>>>, type: WATCH_MODE): void;

  /**
   * Removes a subscriber that was watching specific form field values.
   * @param publish - The same callback function that was used to register
   * @param type - The same watch mode that was used to register
   * @param names - The same field names that were used to register
   */
  removeValueSubscriber<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValues<T, K>>>,
    type: WATCH_MODE,
    names: K[],
  ): void;

  /**
   * Removes a subscriber that was watching validation statuses for all fields.
   * @param publish - The same callback function that was used to register
   */
  removeGlobalValidationStatusSubscriber(
    publish: Dispatch<SetStateAction<PartialRecord<keyof T, ValidationStatus | undefined>>>,
  ): void;

  /**
   * Removes a subscriber that was watching validation statuses for specific fields.
   * @param publish - The same callback function that was used to register
   * @param names - The field names that were being watched
   */
  removeValidationStatusSubscriber<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValidations<T, K>>>,
    names: K[],
  ): void;

  /**
   * Handles field value changes triggered by user input.
   * @param name - Name of the field that changed
   * @param value - New value for the field
   * @param hasFocus - Whether the field currently has user focus
   */
  onFieldChange<K extends keyof T>(name: K, value: T[K] | undefined, hasFocus: boolean): void;

  /**
   * Handles field blur events when user leaves a field.
   * @param name - Name of the field that was blurred
   * @param data - Optional additional data to pass to blur handlers
   * @returns Promise that resolves when blur handling is complete
   */
  onFieldBlur(name: keyof T, data: AnyRecord | undefined): Promise<void>;

  /**
   * Updates the validation status for a specific field.
   * @param name - Name of the field to update
   * @param validationStatus - New validation status to set
   */
  updateValidationStatus(name: keyof T, validationStatus: ValidationStatus): void;

  /**
   * Retrieves the form submission handler callback if one has been set.
   * @returns Form submission callback or undefined if none is set
   */
  getHandleFormSubmit(): ((formValues: T) => void | Promise<void>) | undefined;
}

/**
 * Public API for form context, providing form state management and interaction methods.
 * This is the main interface developers use to interact with forms.
 *
 * @template T - The form field values type
 */
export interface FormContextApi<T extends FieldValues> {
  /**
   * Internal form implementation details.
   *
   * **⚠️ WARNING: DO NOT use outside this library.**
   * This object may have breaking changes in minor or patch versions.
   *
   * @internal
   */
  formInternal: FormInternal<T>;

  /**
   * Retrieves all current form field values.
   * @returns Object containing all form field values
   * @example
   * ```ts
   * const { getFormValues } = useForm();
   * const currentValues = getFormValues();
   * console.log(currentValues);
   * // { name: 'John', email: 'john@example.com', age: 25 }
   * ```
   */
  getFormValues(): Partial<T>;

  /**
   * Updates multiple form field values at once.
   * @param newValues - Object containing the new values to set
   * @example
   * ```ts
   * const { setFormValues } = useForm();
   *
   * // Update multiple fields
   * setFormValues({
   *   name: 'Jane Doe',
   *   email: 'jane@example.com'
   * });
   *
   * // Partial updates are also supported
   * setFormValues({ name: 'John Smith' });
   * ```
   */
  setFormValues(newValues: Partial<T>): void;

  /**
   * Resets all form fields to their default values and triggers a re-render.
   * This clears all field values and validation states.
   *
   * @example
   * ```ts
   * const { resetForm } = useForm();
   *
   * const handleReset = () => {
   *   resetForm(); // All fields return to default state
   * };
   *
   * return <button onClick={handleReset}>Reset Form</button>;
   * ```
   */
  resetForm(): void;

  /**
   * Creates a form submission handler that validates and processes form data.
   *
   * @param submitCallback - Function to execute when form is successfully submitted
   * @returns Form event handler that can be attached to form onSubmit
   *
   * @example
   * ```tsx
   * const { handleSubmit } = useForm();
   *
   * const onSubmit = handleSubmit((formData) => {
   *   console.log('Form submitted:', formData);
   *   // Handle form submission (e.g., API call)
   * });
   *
   * return (
   *   <form onSubmit={onSubmit}>
   *     ...
   *     <button type="submit">Submit</button>
   *   </form>
   * );
   * ```
   */
  handleSubmit(submitCallback: (formValues: T) => void | Promise<void>): () => void;
}

// biome-ignore lint/suspicious/noExplicitAny: How to do differently? :-(
export const FormContext = createContext<FormContextApi<any> | null>(null);

/**
 * Hook to access the form context API within form components.
 *
 * This hook provides access to form state management functions and should only be used
 * within components that are wrapped by a Form provider.
 *
 * @template T - The form field values type, defaults to a generic record
 * @returns The form context API for managing form state and interactions
 *
 * @throws Error if used outside of a Form context provider
 *
 * @example
 * ```tsx
 * function CustomFormField() {
 *   const { getFormValues, setFormValues } = useFormContext<{
 *     name: string;
 *     email: string;
 *   }>();
 *
 *   const handleClearForm = () => {
 *     setFormValues({ name: '', email: '' });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleClearForm}>Clear Form</button>
 *       <pre>{JSON.stringify(getFormValues(), null, 2)}</pre>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFormContext<T extends FieldValues = Record<string, Record<string, unknown>>>(): FormContextApi<T> {
  const context = use(FormContext);

  if (!context) {
    throw new Error('useFormContext must be used within FormContext');
  }

  return context as FormContextApi<T>;
}
