import { createContext, type Dispatch, type SetStateAction, use } from 'react';
import type { FieldValues } from '../../shared/types/field-value';
import type { VALIDATION_OUTCOME } from '../../shared/types/validation';

export type ValidationStatusesSetter = Dispatch<SetStateAction<VALIDATION_OUTCOME>>;

export interface WizardContextApi<WizardValues extends Record<string, FieldValues>> {
  /**
   * Retrieves the form values for a specific wizard step.
   * @param stepName - The name of the step to get values from
   * @returns The field values for the specified step, or undefined if the step doesn't exist or has no values
   * @example
   * ```ts
   * const userInfoValues = getValuesOfStep('userInfo');
   * ```
   */
  getValuesOfStep<Step extends keyof WizardValues>(stepName: Step): WizardValues[Step] | undefined;

  /**
   * Retrieves the form values for the currently active wizard step.
   * @returns The field values for the current step, or undefined if no current step or no values
   * @example
   * ```ts
   * const currentStepValues = getValuesOfCurrentStep();
   * ```
   */
  getValuesOfCurrentStep<Step extends keyof WizardValues>(): WizardValues[Step] | undefined;

  /**
   * Retrieves the form values for all wizard steps.
   * @returns An object containing all step values, keyed by step name
   * @example
   * ```ts
   * const allValues = getValuesOfSteps();
   * console.log(allValues.userInfo, allValues.preferences);
   * ```
   */
  getValuesOfSteps(): WizardValues;

  /**
   * Internal API for wizard implementation details.
   *
   * **⚠️ WARNING: DO NOT use outside this library.**
   * This object may have breaking changes in minor or patch versions.
   *
   * @internal
   */
  wizardInternal: {
    /**
     * Registers a listener for step validation status changes.
     * @param stepStatusSetter - React state setter function to update step validation status
     */
    registerStepStatusListener(stepStatusSetter: ValidationStatusesSetter): void;

    /**
     * Unregisters a previously registered step validation status listener.
     * @param stepStatusSetter - The same setter function that was previously registered
     */
    unregisterStepStatusListener(stepStatusSetter: ValidationStatusesSetter): void;

    /**
     * Sets the callback function used to retrieve form values for the current step.
     * @param stepValuesGetter - Function that returns the current step's form values
     */
    setValuesGetterForCurrentStep(stepValuesGetter: () => FieldValues | undefined): void;

    /**
     * Updates the validation status for the current step.
     * @param status - The new validation outcome status
     */
    stepStatusSetter(status: VALIDATION_OUTCOME): void;

    /**
     * React state setter to update whether the current step is ready for navigation.
     */
    setIsStepReady: Dispatch<SetStateAction<boolean>>;
  };

  /**
   * Navigates directly to a specific previous step in the wizard.
   * @param previousStep - The name of the step to navigate to (must be a previous step)
   * @example
   * ```ts
   * goBackTo('userInfo'); // Jump back to the userInfo step
   * ```
   */
  goBackTo(previousStep: keyof WizardValues): void;

  /**
   * Advances to the next step in the wizard sequence, or triggers the finish callback if on the last step.
   * @returns Promise that resolves when the navigation or finish action is complete
   * @example
   * ```ts
   * await goNext(); // Move to next step or finish wizard
   * ```
   */
  goNext(): Promise<void>;

  /**
   * Navigates to the previous step in the wizard sequence, or triggers the quit callback if on the first step.
   * @example
   * ```ts
   * goPrevious(); // Go back one step or quit wizard
   * ```
   */
  goPrevious(): void;

  /**
   * Array of all step names in the wizard, in the order they appear.
   * @example
   * ```ts
   * console.log(steps); // ['userInfo', 'preferences', 'review']
   * ```
   */
  steps: (keyof WizardValues)[];

  /**
   * The name of the currently active step, or undefined if no step is active.
   * @example
   * ```ts
   * if (currentStep === 'userInfo') {
   *   // Handle user info step
   * }
   * ```
   */
  currentStep: keyof WizardValues | undefined;

  /**
   * Indicates whether the current step is the final step in the wizard.
   */
  isLastStep: boolean;

  /**
   * Indicates whether the current step is the first step in the wizard.
   */
  isFirstStep: boolean;

  /**
   * Indicates whether the current step has passed validation and is ready for navigation.
   */
  isStepReady: boolean;
}

// biome-ignore lint/suspicious/noExplicitAny: How to do differently? :-(
export const WizardContext = createContext<WizardContextApi<any> | null>(null);

export function useWizardContext<
  WizardValues extends Record<string, FieldValues> = Record<string, Record<string, unknown>>,
>(): WizardContextApi<WizardValues> {
  const wizardContext = use(WizardContext);

  if (wizardContext === null) {
    throw new Error('useWizardContext must be used within a wizard context.');
  }

  return wizardContext as WizardContextApi<WizardValues>;
}
