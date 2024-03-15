import { ReactNode, useEffect } from 'react';
import { FieldValues } from '../../shared/types/FieldValue';
import { CONTEXT_WIZARD_DEFAULT, useWizardContext } from '../contexts/WizardContext';
import { StepValidator } from '../types';
import { useCallbackRef } from '../../shared/util/common.util';

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

  const onNextRef = useCallbackRef(onNext);
  const registerStepRef = useCallbackRef(registerStep);
  const unregisterStepRef = useCallbackRef(unregisterStep);

  // When Step is used outside wizard context, it will throw an error
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (wizard === CONTEXT_WIZARD_DEFAULT) {
    throw new Error('Step not in wizard');
  }

  useEffect(() => {
    registerStepRef(name, onNextRef, noFooter, title);
    return () => unregisterStepRef(name);
  }, [name, noFooter, onNextRef, registerStepRef, title, unregisterStepRef]);

  useEffect(() => {
    if (currentStep === name) {
      setIsStepReady(true);
    }
  }, [currentStep, name, setIsStepReady]);

  if (currentStep !== name) {
    return null;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
