import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
} from 'react';
import {
  AnyRecord,
  FieldValue,
  ValidationStatus,
} from '../../shared';
import { WATCH_MODE } from '../types/WatchMode';
import { PartialRecord } from '../../shared/types/PartialRecord';

export type PublishSubscriber<T extends FieldValue | ValidationStatus> =
  Dispatch<SetStateAction<Record<string, T>>>;

export type FormValues<T extends Record<string, FieldValue>, Keys extends keyof T> = {
  [K in Keys]: T[K] | undefined;
}

export type FormValidations<T extends Record<string, FieldValue>, Keys extends keyof T> = {
  [K in Keys]: ValidationStatus | undefined;
}

export interface FormInternal<T extends Record<string, FieldValue>> {
  registerField<K extends keyof T>(
    name: K,
    setValue: (value: T[K] | undefined) => void,
  ): void,

  unregisterField(name: keyof T): void,

  addValueSubscriber<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValues<T, K>>>,
    type: WATCH_MODE,
    names: K[],
  ): void,

  addValueSubscriber(
    publish: Dispatch<SetStateAction<Partial<T>>>,
    type: WATCH_MODE,
  ): void,

  removeValueSubscriber<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValues<T, K>>>,
    type: WATCH_MODE,
    name: K[],
  ): void,

  removeValueSubscriber(
    publish: Dispatch<SetStateAction<Partial<T>>>,
    type: WATCH_MODE,
  ): void,

  addValidationStatusSubscriber<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValidations<T, keyof T>>>,
    name: K[],
  ): void,

  addValidationStatusSubscriber(
    publish: Dispatch<SetStateAction<Record<keyof T, ValidationStatus | undefined>>>,
  ): void,

  removeValidationStatusSubscriber<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValidations<T, K>>>,
    name: K[],
  ): void,

  removeValidationStatusSubscriber(
    publish: Dispatch<SetStateAction<Record<keyof T, ValidationStatus | undefined>>>,
  ): void,

  handleOnChange<K extends keyof T>(
    name: K,
    value: T[K],
    hasFocus: boolean,
  ): void,

  handleOnBlur<K extends keyof T>(
    name: K,
    data: AnyRecord | undefined,
  ): void,

  getFormValuesForNames<K extends keyof T>(
    names: K[],
  ): FormValues<T, K>,

  getFormValuesForNames(): Partial<T>,

  getFormErrorsForNames<K extends keyof T>(
    names?: K[],
  ): Record<K, ValidationStatus | undefined>,

  getFormErrorsForNames(): PartialRecord<keyof T, ValidationStatus>,

  updateValidationStatus(
    name: keyof T,
    validationStatus: ValidationStatus,
  ): void

  getHandleFormSubmit(): ((formValues: T) => (void | Promise<void>)) | undefined,
}

export interface FormContextApi<T extends Record<string, FieldValue>> {
  /**
   * DO NOT use outside of library components like Field, useValues, useValidations
   */
  formInternal: FormInternal<T>,
  getFormValues(): Partial<T>,
  resetForm(): void,
  setFormValues(newValues: Partial<T>, eraseAll?: boolean): void,
  handleSubmit(submitCallback: (formValues: Partial<T>) => (void | Promise<void>)): () => void,
}

export const FORM_INTERVAL_DEFAULT: FormInternal<any> = {
  registerField: (): void => {},
  unregisterField: (): void => {},
  addValueSubscriber: (): void => {},
  removeValueSubscriber: (): void => {},
  addValidationStatusSubscriber: (): void => {},
  removeValidationStatusSubscriber: (): void => {},
  handleOnChange: (): void => {},
  handleOnBlur: (): void => {},
  getFormValuesForNames: () => ({}),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getFormErrorsForNames: (): Record<string, ValidationStatus> => ({}),
  updateValidationStatus: (): void => {},
  getHandleFormSubmit: () => undefined,
};

export const CONTEXT_FORM_DEFAULT: FormContextApi<any> = {
  formInternal: FORM_INTERVAL_DEFAULT,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getFormValues: () => ({}),
  resetForm: () => {},
  setFormValues: () => {},
  handleSubmit: () => () => {},
};

export const FormContext = createContext<FormContextApi<any>>(CONTEXT_FORM_DEFAULT);

/**
 * Get React Context for form
 */
export function useFormContext<T extends Record<string, FieldValue>>(): FormContextApi<T> {
  return useContext(FormContext);
}
