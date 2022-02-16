import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
} from 'react';
import {
  FieldValues,
  VALIDATION_OUTCOME,
} from '../../shared';
import {
  PlaceholderContentSetter,
  StepValidator,
} from '../types';

export type ValidationStatusesSetter = Dispatch<SetStateAction<VALIDATION_OUTCOME>>;

export interface WizardContextApi {
  steps: string[],
  currentStep: string | undefined,
  registerStep: (
    name: string,
    validationFn?: StepValidator,
    noFooter?: boolean,
    title?: string,
  ) => void,
  unregisterStep: (name: string) => void,
  handleOnNext: () => Promise<void>,
  handleOnPrevious: () => void,
  updatePlaceholderContent: (placement: string, children: ReactNode) => void,
  resetPlaceholderContent: (placement?: string) => void,
  registerPlaceholder: (
    placeholderContentSetter: PlaceholderContentSetter,
    stepStatusSetter: ValidationStatusesSetter,
  ) => void,
  unregisterPlaceholder: (
    placeholderContentSetter: PlaceholderContentSetter,
    stepStatusSetter: ValidationStatusesSetter,
  ) => void,
  isLastStep: boolean,
  isFirstStep: boolean,
  hasNoFooter: boolean,
  stepStatusSetter: ValidationStatusesSetter,
  isStepReady: boolean,
  stepsTitles: {name: string, title: string | undefined}[],
  setIsStepReady: Dispatch<SetStateAction<boolean>>,
  setValuesGetterForCurrentStep: (
    stepValuesGetter: () => FieldValues | undefined
  ) => void,
  getValuesOfCurrentStep: () => FieldValues | undefined,
  getValuesOfStep: (stepName: string) => FieldValues | undefined,
  getValuesOfSteps: () => Record<string, FieldValues | undefined>
}

export const CONTEXT_WIZARD_DEFAULT: WizardContextApi = {
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

export const WizardContext = createContext(
  CONTEXT_WIZARD_DEFAULT,
);
export function useWizardContext(): WizardContextApi {
  return useContext(WizardContext);
}
