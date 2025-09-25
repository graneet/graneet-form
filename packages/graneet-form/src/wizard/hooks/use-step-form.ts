import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef } from 'react';
import type { FormContextApi } from '../../form/contexts/form-context';
import { type UseFormOptions, useForm } from '../../form/hooks/use-form';
import type { FieldValues } from '../../shared/types/field-value';
import type { PartialRecord } from '../../shared/types/partial-record';
import { VALIDATION_OUTCOME, type ValidationStatus, type ValidationStatuses } from '../../shared/types/validation';
import { mapValidationStatusesToOutcome } from '../../shared/util/validation.util';
import { useWizardContext } from '../contexts/wizard-context';

/**
 * API returned by the useStepForm hook for managing form state within a wizard step.
 * @template T - The field values type for this step
 */
interface UseStepFormApi<T extends FieldValues> {
  /**
   * Form context API that can be passed to Form components.
   * Contains all form management functionality including validation, field registration, and submission handling.
   */
  form: FormContextApi<T>;

  /**
   * Initializes form values if no values have been previously set for this step.
   *
   * **⚠️ DEPRECATED:** Use the `defaultValues` prop in useStepForm options instead.
   *
   * @param initialValues - Initial values to set for the form fields
   * @deprecated Use `defaultValues` prop instead for better performance and consistency
   * @example
   * ```ts
   * // ❌ Deprecated approach
   * const { initFormValues } = useStepForm();
   * initFormValues({ name: 'John', email: '' });
   *
   * // ✅ Preferred approach
   * const { form } = useStepForm({
   *   defaultValues: { name: 'John', email: '' }
   * });
   * ```
   */
  initFormValues(initialValues: Partial<T>): void;
}

/**
 * Hook for integrating forms within wizard steps, providing automatic data persistence
 * and validation status synchronization between steps.
 *
 * This hook automatically:
 * - Preserves form data when navigating between steps
 * - Syncs validation status with the wizard navigation
 * - Restores previously entered values when returning to a step
 * - Manages step readiness based on form validation
 *
 * @template WizardValues - Complete wizard values type (all steps combined)
 * @template Step - The current step key
 * @param props - Form configuration options, same as useForm
 * @returns API for managing the step form including form context and initialization
 *
 * @example
 * ```tsx
 * // Define wizard step types
 * type WizardData = {
 *   userInfo: { name: string; email: string };
 *   preferences: { theme: 'light' | 'dark'; notifications: boolean };
 * };
 *
 * // In a step component
 * function UserInfoStep() {
 *   const { form } = useStepForm<WizardData, 'userInfo'>({
 *     defaultValues: { name: '', email: '' }
 *   });
 *
 *   return (
 *     <Form form={form}>
 *       ...
 *     </Form>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With validation rules
 * function PreferencesStep() {
 *   const { form } = useStepForm<WizardData, 'preferences'>({
 *     defaultValues: { theme: 'light', notifications: true }
 *   });
 *
 *   return (
 *     <Form form={form}>
 *       ...
 *     </Form>
 *   );
 * }
 * ```
 */
export function useStepForm<
  WizardValues extends Record<string, FieldValues> = Record<string, Record<string, unknown>>,
  Step extends keyof WizardValues = '',
>(props?: UseFormOptions<WizardValues[Step]>): UseStepFormApi<WizardValues[Step]> {
  const {
    wizardInternal: { stepStatusSetter, setValuesGetterForCurrentStep },
    getValuesOfCurrentStep,
  } = useWizardContext<WizardValues[Step]>();
  const valuesHasBeenInitializedRef = useRef(false);

  const form = useForm<WizardValues[Step]>({
    ...props,
    defaultValues: getValuesOfCurrentStep() ?? props?.defaultValues,
  });

  const {
    formInternal: { addGlobalValidationStatusSubscriber },
    getFormValues,
    setFormValues,
  } = form;

  useEffect(() => {
    // Form validation is async.
    // So by then, set step status to undefined, the user will not be able to go to next step
    stepStatusSetter(VALIDATION_OUTCOME.UNDETERMINED);

    const setFormStatusFromValidationStatuses = ((validationStatuses: ValidationStatuses<WizardValues[Step]>) => {
      stepStatusSetter(mapValidationStatusesToOutcome(validationStatuses));
    }) as Dispatch<SetStateAction<PartialRecord<keyof WizardValues[Step], ValidationStatus | undefined>>>;
    /*
      Put function onto the queue. The action will be done only pending render is done
      In case of big step with many inputs, stepStatus will stay UNDETERMINED until that the render
      is done and only after that, the timeout will be run
     */
    setTimeout(() => addGlobalValidationStatusSubscriber(setFormStatusFromValidationStatuses), 0);

    return () => {
      setValuesGetterForCurrentStep(() => undefined);
      // On step switch, switch stepStatus, user will not be stuck on not clickable button
      stepStatusSetter(VALIDATION_OUTCOME.VALID);
    };
  }, [stepStatusSetter, setValuesGetterForCurrentStep, addGlobalValidationStatusSubscriber]);

  useEffect(() => {
    setValuesGetterForCurrentStep(getFormValues);
  }, [getFormValues, setValuesGetterForCurrentStep]);

  useEffect(() => {
    const valuesOfCurrentStep = getValuesOfCurrentStep() as Partial<WizardValues[Step]>;
    // If values for the current step are stored in the wizard context, we update values of the form
    // and set valuesHasBeenInitialized to true to detect if values getting has been done
    if (valuesOfCurrentStep) {
      valuesHasBeenInitializedRef.current = true;
      setFormValues(valuesOfCurrentStep);
    }
  }, [getValuesOfCurrentStep, setFormValues]);

  const initFormValues = useCallback(
    (initialValues: Partial<WizardValues[Step]>): void => {
      // when values from the wizard has been gotten, the function do nothing
      if (!valuesHasBeenInitializedRef.current) {
        setFormValues(initialValues);
      }
    },
    [setFormValues],
  );

  return useMemo(
    () => ({
      initFormValues,
      form,
    }),
    [form, initFormValues],
  );
}
