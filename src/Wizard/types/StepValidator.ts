import { FieldValues } from '../../shared';

export type StepValidator<
  Steps extends string,
  WizardValues extends Record<Steps, FieldValues>,
  Step extends Steps,
  > = (
  stepValues: WizardValues[Step] | undefined
) => boolean | Promise<boolean>;
