import type { FieldValues } from '../../shared/types/FieldValue';

export type StepValidator<WizardValues extends Record<string, FieldValues>, Step extends keyof WizardValues> = (
  stepValues: WizardValues[Step] | undefined,
) => boolean | Promise<boolean>;
