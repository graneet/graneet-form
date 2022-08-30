import { ReactNode, useEffect } from 'react';
import { FieldValues } from '../../shared/types/FieldValue';
import { CONTEXT_WIZARD_DEFAULT, useWizardContext } from '../contexts/WizardContext';
import { StepValidator } from '../types';

export interface StepProps<Steps extends string, WizardValues extends Record<Steps, FieldValues>, Step extends Steps> {
  children: ReactNode;
  name: Step;
  onNext?: StepValidator<Steps, WizardValues, Step>;
  noFooter?: boolean;
  title?: string;
}

/**
 * Step used in Wizard
 * @param children Node
 * @param name Step name
 * @param onNext (optional) Function ran at click on next
 * @param noFooter (optional) has footer if not specified`
 * @param title Title of the step
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
export function Step<Steps extends string, WizardValues extends Record<Steps, FieldValues>, Step extends Steps>({
  children,
  name,
  onNext,
  noFooter,
  title,
}: StepProps<Steps, WizardValues, Step>) {
  const wizard = useWizardContext<Steps, WizardValues>();

  const { registerStep, unregisterStep, currentStep, setIsStepReady } = wizard;

  // When Step is used outside of wizard context, it will throw an error
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (wizard === CONTEXT_WIZARD_DEFAULT) {
    throw new Error('Step not in wizard');
  }

  useEffect(() => {
    registerStep(name, onNext, noFooter, title);
    return () => unregisterStep(name);
  }, [registerStep, unregisterStep, name, onNext, noFooter, title]);

  useEffect(() => {
    if (currentStep === name) {
      setIsStepReady(true);
    }
  }, [currentStep, name, setIsStepReady]);

  if (currentStep !== name) {
    return null;
  }

  return children;
}
