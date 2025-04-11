import type { FieldValues } from '../../shared/types/field-value';

export type FormValues<T extends FieldValues, Keys extends keyof T> = {
  [K in Keys]: T[K] | undefined;
};
