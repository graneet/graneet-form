import type { FieldValues } from './field-value';

export enum VALIDATION_OUTCOME {
  VALID = 'VALID',
  INVALID = 'INVALID',
  UNDETERMINED = 'UNDETERMINED',
}

export interface ValidationStatus {
  status: VALIDATION_OUTCOME;
  message: string | undefined;
}

export type ValidationStatuses<T extends FieldValues> = Record<keyof T, ValidationStatus | undefined>;
