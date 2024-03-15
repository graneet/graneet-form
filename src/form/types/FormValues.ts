import type { FieldValues } from '../../shared';

export type FormValues<T extends FieldValues, Keys extends keyof T> = {
  [K in Keys]: T[K] | undefined;
};
