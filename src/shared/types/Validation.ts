import { FieldValue } from './FieldValue';

export enum VALIDATION_OUTCOME {
  VALID = 'VALID',
  INVALID = 'INVALID',
  UNDETERMINED = 'UNDETERMINED',
}

export interface ValidationStatus {
  status: VALIDATION_OUTCOME,
  message: string | undefined
}

export type ValidationStatuses<T extends Record<string, FieldValue>> = Record<keyof T, ValidationStatus | undefined>;
