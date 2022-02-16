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

export interface FormInternal {
  registerField: (
    name: string,
    setValue: (value: FieldValue) => void,
  ) => void,
  unregisterField: (name: string) => void,
  addValueSubscriber: (
    publish: PublishSubscriber<FieldValue>,
    type: WATCH_MODE,
    name?: string[],
  ) => void,
  removeValueSubscriber: (
    publish: PublishSubscriber<FieldValue>,
    type: WATCH_MODE,
    name?: string[],
  ) => void,
  addValidationStatusSubscriber: (
    publish: PublishSubscriber<ValidationStatus>,
    name?: string[],
  ) => void,
  removeValidationStatusSubscriber: (
    publish: PublishSubscriber<ValidationStatus>,
    names?: string[],
  ) => void,
  handleOnChange: (
    name: string,
    value: FieldValue,
    hasFocus: boolean,
  ) => void,
  handleOnBlur: (
    name: string,
    data: AnyRecord | undefined,
  ) => void,
  getFormValuesForNames: (
    names?: string[],
  ) => FieldValues,
  getFormErrorsForNames: (
    names?: string[],
  ) => Record<string, ValidationStatus>,
  updateValidationStatus: (
    name: string,
    validationStatus: ValidationStatus,
  ) => void
}

export interface FormContextApi {
  /**
   * DO NOT use outside of library components like Field, useValues, useValidations
   */
  formInternal: FormInternal,
  getFormValues: () => FieldValues,
  resetForm: () => void,
  setFormValues: (newValues: FieldValues, eraseAll?: boolean) => void,
}

export const FORM_INTERVAL_DEFAULT: FormInternal = {
  registerField: (): void => {},
  unregisterField: (): void => {},
  addValueSubscriber: (): void => {},
  removeValueSubscriber: (): void => {},
  addValidationStatusSubscriber: (): void => {},
  removeValidationStatusSubscriber: (): void => {},
  handleOnChange: (): void => {},
  handleOnBlur: (): void => {},
  getFormValuesForNames: (): FieldValues => ({}),
  getFormErrorsForNames: (): Record<string, ValidationStatus> => ({}),
  updateValidationStatus: (): void => {},
};

export const CONTEXT_FORM_DEFAULT: FormContextApi = {
  formInternal: FORM_INTERVAL_DEFAULT,
  getFormValues: () => ({}),
  resetForm: () => {},
  setFormValues: () => {},
};

export const FormContext = createContext(
  CONTEXT_FORM_DEFAULT,
);

/**
 * Get React Context for form
 */
export function useFormContext(): FormContextApi {
  return useContext(FormContext);
}
