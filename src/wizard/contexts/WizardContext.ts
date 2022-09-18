import { createContext, Dispatch, ReactNode, SetStateAction, useContext } from 'react';
import { FieldValues, VALIDATION_OUTCOME } from '../../shared';
import { PlaceholderContentSetter, StepValidator } from '../types';

export type ValidationStatusesSetter = Dispatch<SetStateAction<VALIDATION_OUTCOME>>;

export interface WizardContextApi<Steps extends string, WizardValues extends Record<Steps, FieldValues>> {
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

    registerStep<Step extends Steps>(
      name: Step,
      validationFn?: StepValidator<Steps, WizardValues, Step>,
      noFooter?: boolean,
      title?: string,
    ): void;

    unregisterStep(name: Steps): void;

    setIsStepReady: Dispatch<SetStateAction<boolean>>;

    stepStatusSetter: (status: VALIDATION_OUTCOME) => void;

    setValuesGetterForCurrentStep(stepValuesGetter: () => FieldValues | undefined): void;
  };

  steps: Steps[];

  currentStep: Steps | undefined;

  handleOnNext(): Promise<void>;

  handleOnPrevious(): void;

  isLastStep: boolean;

  isFirstStep: boolean;

  hasNoFooter: boolean;

  isStepReady: boolean;

  stepsTitles: { name: Steps; title: string | undefined }[];

  getValuesOfCurrentStep<Step extends Steps>(): WizardValues[Step] | undefined;

  getValuesOfStep<Step extends Steps>(stepName: Step): WizardValues[Step] | undefined;

  getValuesOfSteps(): WizardValues;
}

export const CONTEXT_WIZARD_DEFAULT: WizardContextApi<string, Record<string, never>> = {
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

export const WizardContext = createContext<WizardContextApi<any, any>>(CONTEXT_WIZARD_DEFAULT);
export function useWizardContext<
  Steps extends string,
  WizardValues extends Record<Steps, FieldValues>,
>(): WizardContextApi<Steps, WizardValues> {
  return useContext(WizardContext);
}
