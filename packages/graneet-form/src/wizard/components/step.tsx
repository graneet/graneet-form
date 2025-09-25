import { type ReactNode, useEffect } from 'react';
import type { FieldValues } from '../../shared/types/field-value';
import { useWizardContext } from '../contexts/wizard-context';
import type { StepValidator } from '../types/step-validator';

export interface StepProps<WizardValues extends Record<string, FieldValues>, Step extends keyof WizardValues> {
  children: ReactNode;
  name: Step;
  onNext?: StepValidator<WizardValues, Step>;
  noFooter?: boolean;
  title?: string;
}

/**
 * Step used in Wizard
 * @param children Node
 * @param name Step name
 * @example
 * ```
 * <Wizard>
 *   <Step name="StepOne" >
 *     1
 *   </Step>
 *   <Step name="StepTwo" >
 *     2
 *   </Step>
 * </Wizard
 * ``
 */
export function Step<
  WizardValues extends Record<string, FieldValues> = Record<never, FieldValues>,
  Step extends keyof WizardValues = keyof WizardValues,
>({ children, name }: StepProps<WizardValues, Step>) {
  const wizard = useWizardContext<WizardValues>();

  const {
    currentStep,
    wizardInternal: { setIsStepReady },
  } = wizard;

  useEffect(() => {
    if (currentStep === name) {
      setIsStepReady(true);
    }
  }, [currentStep, name, setIsStepReady]);

  if (currentStep !== name) {
    return null;
  }

  return <>{children}</>;
}
