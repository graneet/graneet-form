import {
  ReactNode,
  useEffect,
} from 'react';
import {
  CONTEXT_WIZARD_DEFAULT,
  useWizardContext,
} from '../contexts/WizardContext';
import { StepValidator } from '../types';

export interface StepProps {
  children: ReactNode,
  name: string,
  onNext?: StepValidator,
  noFooter?: boolean,
  title?: string,
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
export function Step({
  children,
  name,
  onNext,
  noFooter,
  title,
}: StepProps) {
  const wizard = useWizardContext();

  const {
    registerStep,
    unregisterStep,
    currentStep,
    setIsStepReady,
  } = wizard;

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
