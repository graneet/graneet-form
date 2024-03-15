import type { FieldValues } from '../../shared';

export type StepValidator<
  WizardValues extends Record<string, FieldValues>,
  Step extends keyof WizardValues,
> = (stepValues: WizardValues[Step] | undefined) => boolean | Promise<boolean>;
