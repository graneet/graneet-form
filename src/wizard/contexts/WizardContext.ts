import { createContext, Dispatch, ReactNode, SetStateAction, useContext } from 'react';
import { FieldValues, VALIDATION_OUTCOME } from '../../shared';
import { PlaceholderContentSetter, StepValidator } from '../types';

export type ValidationStatusesSetter = Dispatch<SetStateAction<VALIDATION_OUTCOME>>;

export interface WizardContextApi<WizardValues extends Record<string, FieldValues>> {
  wizardInternal: {
    updatePlaceholderContent(placement: string, children: ReactNode): void;

    resetPlaceholderContent(placement?: string): void;

    registerPlaceholder(
      placeholderContentSetter: PlaceholderContentSetter,
      stepStatusSetter: ValidationStatusesSetter,
    ): void;

    unregisterPlaceholder(
      placeholderContentSetter: PlaceholderContentSetter,
      stepStatusSetter: ValidationStatusesSetter,
    ): void;

    registerStep<Step extends keyof WizardValues>(
      name: Step,
      validationFn?: StepValidator<WizardValues, Step>,
      noFooter?: boolean,
      title?: string,
    ): void;

    unregisterStep(name: keyof WizardValues): void;

    setIsStepReady: Dispatch<SetStateAction<boolean>>;

    stepStatusSetter: (status: VALIDATION_OUTCOME) => void;

    setValuesGetterForCurrentStep(stepValuesGetter: () => FieldValues | undefined): void;
  };

  steps: (keyof WizardValues)[];

  currentStep: keyof WizardValues | undefined;

  handleOnNext(): Promise<void>;

  handleOnPrevious(): void;

  isLastStep: boolean;

  isFirstStep: boolean;

  hasNoFooter: boolean;

  isStepReady: boolean;

  stepsTitles: { name: keyof WizardValues; title: string | undefined }[];

  getValuesOfCurrentStep<Step extends keyof WizardValues>(): WizardValues[Step] | undefined;

  getValuesOfStep<Step extends keyof WizardValues>(stepName: Step): WizardValues[Step] | undefined;

  getValuesOfSteps(): WizardValues;
}

export const CONTEXT_WIZARD_DEFAULT: WizardContextApi<Record<string, never>> = {
  wizardInternal: {
    updatePlaceholderContent: () => {},
    resetPlaceholderContent: () => {},
    registerStep: () => {},
    unregisterStep: () => {},
    registerPlaceholder: () => {},
    unregisterPlaceholder: () => {},
    stepStatusSetter: () => {},
    setIsStepReady: () => {},
    setValuesGetterForCurrentStep: () => {},
  },
  steps: [],
  currentStep: undefined,
  handleOnNext: async () => {},
  handleOnPrevious: () => {},
  isLastStep: false,
  isFirstStep: false,
  hasNoFooter: true,
  isStepReady: false,
  stepsTitles: [],
  getValuesOfCurrentStep: () => undefined,
  getValuesOfStep: () => undefined,
  getValuesOfSteps: () => ({}),
};

export const WizardContext = createContext<WizardContextApi<any>>(CONTEXT_WIZARD_DEFAULT);
export function useWizardContext<WizardValues extends Record<string, FieldValues>>(): WizardContextApi<WizardValues> {
  return useContext(WizardContext);
}
