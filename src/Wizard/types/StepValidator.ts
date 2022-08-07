import { FieldValue } from '../../shared';

export type StepValidator<
  Steps extends string,
  WizardValues extends Record<Steps, Record<string, FieldValue>>,
  Step extends Steps,
  > = (
  stepValues: WizardValues[Step] | undefined
) => boolean | Promise<boolean>;
