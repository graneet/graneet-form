import type { FieldValues } from './field-value';

export type ValidationStatus = 'valid' | 'invalid' | 'undetermined';

export interface ValidationState {
  status: ValidationStatus;
  message: string | undefined;
}

export type ValidationStatuses<T extends FieldValues> = Record<keyof T, ValidationState | undefined>;
