import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
} from 'react';
import {
  FieldValue,
  VALIDATION_OUTCOME,
} from '../../shared';
import {
  PlaceholderContentSetter,
  StepValidator,
} from '../types';

export type ValidationStatusesSetter = Dispatch<SetStateAction<VALIDATION_OUTCOME>>;

export interface WizardContextApi<
  Steps extends string,
  WizardValues extends Record<Steps, Record<string, FieldValue>>
  > {
  steps: Steps[],
  currentStep: Steps | undefined,
  registerStep<Step extends Steps>(
    name: Step,
    validationFn?: StepValidator<Steps, WizardValues, Step>,
    noFooter?: boolean,
    title?: string,
  ): void,
  unregisterStep(name: Steps): void,
  handleOnNext(): Promise<void>,
  handleOnPrevious(): void,
  updatePlaceholderContent(placement: string, children: ReactNode): void,
  resetPlaceholderContent(placement?: string): void,
  registerPlaceholder(
    placeholderContentSetter: PlaceholderContentSetter,
    stepStatusSetter: ValidationStatusesSetter,
  ): void,
  unregisterPlaceholder(
    placeholderContentSetter: PlaceholderContentSetter,
    stepStatusSetter: ValidationStatusesSetter,
  ): void,
  isLastStep: boolean,
  isFirstStep: boolean,
  hasNoFooter: boolean,
  stepStatusSetter: ValidationStatusesSetter,
  isStepReady: boolean,
  stepsTitles: { name: Steps, title: string | undefined }[],
  setIsStepReady: Dispatch<SetStateAction<boolean>>,
  setValuesGetterForCurrentStep(
    stepValuesGetter: () => Record<string, FieldValue> | undefined
  ): void,
  getValuesOfCurrentStep<Step extends Steps>(): WizardValues[Step] | undefined,
  getValuesOfStep<Step extends Steps>(stepName: Step): WizardValues[Step] | undefined,
  getValuesOfSteps(): WizardValues
}

export const CONTEXT_WIZARD_DEFAULT: WizardContextApi<string, Record<string, never>> = {
  steps: [],
  currentStep: undefined,
  registerStep: () => {},
  unregisterStep: () => {},
  handleOnNext: async () => {},
  handleOnPrevious: () => {},
  updatePlaceholderContent: () => {},
  resetPlaceholderContent: () => {},
  registerPlaceholder: () => {},
  unregisterPlaceholder: () => {},
  isLastStep: false,
  isFirstStep: false,
  hasNoFooter: true,
  stepStatusSetter: () => {},
  isStepReady: false,
  stepsTitles: [],
  setIsStepReady: () => {},
  setValuesGetterForCurrentStep: () => {},
  getValuesOfCurrentStep: () => undefined,
  getValuesOfStep: () => undefined,
  getValuesOfSteps: () => ({}),
};

export const WizardContext = createContext<WizardContextApi<any, any>>(
  CONTEXT_WIZARD_DEFAULT,
);
export function useWizardContext<
  Steps extends string,
  WizardValues extends Record<Steps, Record<string, FieldValue>>
  >(): WizardContextApi<Steps, WizardValues> {
  return useContext(WizardContext);
}
