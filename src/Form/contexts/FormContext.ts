import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
} from 'react';
import {
  AnyRecord,
  FieldValue,
  FieldValues,
  ValidationStatus,
} from '../../shared';
import { WATCH_MODE } from '../types/WatchMode';

export type PublishSubscriber<T extends FieldValue | ValidationStatus> =
  Dispatch<SetStateAction<Record<string, T>>>;

type FormValues<T extends Record<string, FieldValue>, Keys extends keyof T> = {
  [K in Keys]: T[K] | undefined;
}

export interface FormInternal<T extends Record<string, FieldValue>> {
  registerField<K extends keyof T>(
    name: K,
    setValue: (value: T[K]) => void,
  ): void,

  unregisterField(name: keyof T): void,

  addValueSubscriber<Keys extends keyof T>(
    publish: Dispatch<SetStateAction<FormValues<T, Keys>>>,
    type: WATCH_MODE,
    name: Keys[],
  ): void,

  addValueSubscriber(
    publish: Dispatch<SetStateAction<T>>,
    type: WATCH_MODE,
  ): void,

  removeValueSubscriber<Keys extends keyof T>(
    publish: Dispatch<SetStateAction<FormValues<T, Keys>>>,
    type: WATCH_MODE,
    name: Keys[],
  ): void,

  removeValueSubscriber(
    publish: Dispatch<SetStateAction<T>>,
    type: WATCH_MODE,
  ): void,

  addValidationStatusSubscriber<Keys extends keyof T>(
    publish: Dispatch<SetStateAction<Record<Keys, ValidationStatus>>>,
    name: Keys[],
  ): void,

  addValidationStatusSubscriber(
    publish: Dispatch<SetStateAction<Record<keyof T, ValidationStatus>>>,
  ): void,

  removeValidationStatusSubscriber<Keys extends keyof T>(
    publish: Dispatch<SetStateAction<Record<Keys, ValidationStatus>>>,
    name: Keys[],
  ): void,

  removeValidationStatusSubscriber(
    publish: Dispatch<SetStateAction<Record<keyof T, ValidationStatus>>>,
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

  getFormValuesForNames(
    names?: (keyof T)[],
  ): FieldValues,

  getFormErrorsForNames<K extends keyof T>(
    names?: K[],
  ): Record<K, ValidationStatus>,

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
  getFormValues(): T,
  resetForm(): void,
  setFormValues(newValues: Partial<T>, eraseAll?: boolean): void,
  handleSubmit(submitCallback: (formValues: T) => (void | Promise<void>)): () => void,
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
  getFormValuesForNames: (): FieldValues => ({}),
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
