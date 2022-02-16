import { FieldValues } from '../../shared';

export type StepValidator = (
  stepValues: FieldValues | undefined
) => boolean | Promise<boolean>;
