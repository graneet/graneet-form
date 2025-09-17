import { type Dispatch, type SetStateAction, createContext, useContext } from 'react';
import type { FieldValues } from '../../shared/types/field-value';
import type { VALIDATION_OUTCOME } from '../../shared/types/validation';
import type { StepValidator } from '../types/step-validator';

export type ValidationStatusesSetter = Dispatch<SetStateAction<VALIDATION_OUTCOME>>;

export interface WizardContextApi<WizardValues extends Record<string, FieldValues>> {
  /**
   * Get values for a specified step.
   * @param stepName Step name
   */
  getValuesOfStep<Step extends keyof WizardValues>(stepName: Step): WizardValues[Step] | undefined;

  /**
   * Get values for the current step.
   */
  getValuesOfCurrentStep<Step extends keyof WizardValues>(): WizardValues[Step] | undefined;

  /**
   * Get values for all the steps.
   */
  getValuesOfSteps(): WizardValues;

  /**
   * DO NOT use outside this library. It may have breaking changes in this object in a minor or patch version
   * @internal
   */
  wizardInternal: {
    /**
     * Register a step status listener.
     * @param stepStatusSetter Setter to update placeholder validations
     */
    registerStepStatusListener(stepStatusSetter: ValidationStatusesSetter): void;

    /**
     * Unregister a step status listener.
     * @param stepStatusSetter Setter to update placeholder validations
     */
    unregisterStepStatusListener(stepStatusSetter: ValidationStatusesSetter): void;

    /**
     * Set callback used to get form values for the current step.
     * @param stepValuesGetter Callback to get current step form values
     */
    setValuesGetterForCurrentStep(stepValuesGetter: () => FieldValues | undefined): void;

    /**
     * Update step status
     * @param status New step status
     */
    stepStatusSetter(status: VALIDATION_OUTCOME): void;

    setIsStepReady: Dispatch<SetStateAction<boolean>>;
  };

  /**
   * Go to a previous step
   */
  goBackTo(previousStep: keyof WizardValues): void;

  /**
   * Go to the next step if there is one or run onFinish function.
   */
  goNext(): Promise<void>;

  /**
   * Go to the previous step if there is one or run onQuit function.
   */
  goPrevious(): void;

  /**
   * Steps name
   */
  steps: (keyof WizardValues)[];

  /**
   * Current step name
   */
  currentStep: keyof WizardValues | undefined;

  /**
   * Boolean to know is the current step is the last
   */
  isLastStep: boolean;

  /**
   * Boolean to know is the current step is the first
   */
  isFirstStep: boolean;

  /**
   * Boolean to know is the current step is ready
   */
  isStepReady: boolean;
}

export const CONTEXT_WIZARD_DEFAULT: WizardContextApi<Record<string, never>> = {
  getValuesOfStep: () => undefined,
  getValuesOfCurrentStep: () => undefined,
  getValuesOfSteps: () => ({}),
  wizardInternal: {
    registerStepStatusListener: () => {},
    unregisterStepStatusListener: () => {},
    stepStatusSetter: () => {},
    setIsStepReady: () => {},
    setValuesGetterForCurrentStep: () => {},
  },
  goNext: async () => {},
  goBackTo: () => {},
  goPrevious: () => {},
  steps: [],
  currentStep: undefined,
  isLastStep: false,
  isFirstStep: false,
  isStepReady: false,
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const WizardContext = createContext<WizardContextApi<any>>(CONTEXT_WIZARD_DEFAULT);
export function useWizardContext<
  WizardValues extends Record<string, FieldValues> = Record<string, Record<string, unknown>>,
>(): WizardContextApi<WizardValues> {
  return useContext(WizardContext);
}
