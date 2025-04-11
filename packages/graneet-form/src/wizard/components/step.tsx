import { type ReactNode, useEffect } from 'react';
import type { FieldValues } from '../../shared/types/field-value';
import { useCallbackRef } from '../../shared/util/use-callback-ref';
import { CONTEXT_WIZARD_DEFAULT, useWizardContext } from '../contexts/wizard-context';
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
export function Step<
  WizardValues extends Record<string, FieldValues> = Record<never, FieldValues>,
  Step extends keyof WizardValues = keyof WizardValues,
>({ children, name, onNext, noFooter, title }: StepProps<WizardValues, Step>) {
  const wizard = useWizardContext<WizardValues>();

  const {
    currentStep,
    wizardInternal: { registerStep, unregisterStep, setIsStepReady },
  } = wizard;

  // When Step is used outside wizard context, it will throw an error
  // @ts-ignore
  if (wizard === CONTEXT_WIZARD_DEFAULT) {
    throw new Error('Step not in wizard');
  }

  const onNextRef = useCallbackRef(onNext ?? (() => true));

  useEffect(() => {
    registerStep(name, onNextRef, noFooter, title);
    return () => unregisterStep(name);
  }, [registerStep, unregisterStep, name, noFooter, title, onNextRef]);

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
