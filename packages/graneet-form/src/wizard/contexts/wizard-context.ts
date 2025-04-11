import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext } from 'react';
import type { FieldValues } from '../../shared/types/field-value';
import type { VALIDATION_OUTCOME } from '../../shared/types/validation';
import type { PlaceholderContentSetter } from '../types/placeholder-content';
import type { StepValidator } from '../types/step-validator';

export type ValidationStatusesSetter = Dispatch<SetStateAction<VALIDATION_OUTCOME>>;

export interface WizardContextApi<WizardValues extends Record<string, FieldValues>> {
  /**
   * Get values for specified step.
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
     * Register step in the Wizard.
     * @param name Step name
     * @param validationFn Function triggered to validate switch to next step
     * @param noFooter If not specified, footer is displayed
     * @param title Step title
     */
    registerStep<Step extends keyof WizardValues>(
      name: Step,
      validationFn?: StepValidator<WizardValues, Step>,
      noFooter?: boolean,
      title?: string,
    ): void;

    /**
     * Unregister a Wizard step.
     * @param name Step name
     */
    unregisterStep(name: keyof WizardValues): void;

    /**
     * Register a placeholder.
     * @param placeholderContentSetter Setter to update placeholder content
     * @param stepStatusSetter Setter to update placeholder validations
     */
    registerPlaceholder(
      placeholderContentSetter: PlaceholderContentSetter,
      stepStatusSetter: ValidationStatusesSetter,
    ): void;

    /**
     * Unregister a placeholder.
     * @param placeholderContentSetter Setter to update placeholder content
     * @param stepStatusSetter Setter to update placeholder validations
     */
    unregisterPlaceholder(
      placeholderContentSetter: PlaceholderContentSetter,
      stepStatusSetter: ValidationStatusesSetter,
    ): void;

    /**
     * Set component in the placeholder.
     * @param placement Placement of the element added
     * @param children Component to add
     */
    updatePlaceholderContent(placement: string, children: ReactNode): void;

    /**
     * Reset placeholder content.
     * @param placement Placement of the deleted element
     */
    resetPlaceholderContent(placement?: string): void;

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
   * @deprecated use `goBackTo`
   */
  handleGoBackTo(previousStep: keyof WizardValues): void;

  /**
   * Go to a previous step
   */
  goBackTo(previousStep: keyof WizardValues): void;

  /**
   * Go to the next step if there is one or run onFinish function.
   * @deprecated use `goNext`
   */
  handleOnNext(): Promise<void>;

  /**
   * Go to the next step if there is one or run onFinish function.
   */
  goNext(): Promise<void>;

  /**
   * Go to the previous step if there is one or run onQuit function.
   * @deprecated use `goPrevious`
   */
  handleOnPrevious(): void;

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
   * Boolean to know is the current step has a footer
   */
  hasNoFooter: boolean;

  /**
   * Boolean to know is the current step is ready
   */
  isStepReady: boolean;

  /**
   * Array of step titles
   */
  stepsTitles: { name: keyof WizardValues; title: string | undefined }[];
}

export const CONTEXT_WIZARD_DEFAULT: WizardContextApi<Record<string, never>> = {
  getValuesOfStep: () => undefined,
  getValuesOfCurrentStep: () => undefined,
  getValuesOfSteps: () => ({}),
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
  handleGoBackTo: () => {},
  handleOnNext: async () => {},
  handleOnPrevious: () => {},
  goNext: async () => {},
  goBackTo: () => {},
  goPrevious: () => {},
  steps: [],
  currentStep: undefined,
  isLastStep: false,
  isFirstStep: false,
  hasNoFooter: true,
  isStepReady: false,
  stepsTitles: [],
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const WizardContext = createContext<WizardContextApi<any>>(CONTEXT_WIZARD_DEFAULT);
export function useWizardContext<
  WizardValues extends Record<string, FieldValues> = Record<string, Record<string, unknown>>,
>(): WizardContextApi<WizardValues> {
  return useContext(WizardContext);
}
