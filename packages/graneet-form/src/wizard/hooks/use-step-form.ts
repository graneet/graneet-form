import { type Dispatch, type SetStateAction, useEffect, useMemo } from 'react';
import type { FormContextApi } from '../../form/contexts/form-context';
import { type UseFormOptions, useForm } from '../../form/hooks/use-form';
import type { FieldValues } from '../../shared/types/field-value';
import type { PartialRecord } from '../../shared/types/partial-record';
import type { ValidationState, ValidationStatuses } from '../../shared/types/validation';
import { mapValidationStatusesToOutcome } from '../../shared/util/validation.util';
import { useWizardContext } from '../contexts/wizard-context';

/**
 * API returned by the useStepForm hook for managing form state within a wizard step.
 * @template T - The field values type for this step
 */
export interface UseStepFormApi<T extends FieldValues> {
  /**
   * Form context API that can be passed to Form components.
   * Contains all form management functionality including validation, field registration, and submission handling.
   */
  form: FormContextApi<T>;
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

  const defaultValues = getValuesOfCurrentStep() ?? props?.defaultValues;
  const form = useForm<WizardValues[Step]>({
    ...props,
    ...(defaultValues && { defaultValues }),
  });

  const {
    formInternal: { addGlobalValidationStatusSubscriber },
    getFormValues,
  } = form;

  useEffect(() => {
    // Form validation is async.
    // So by then, set step status to undefined, the user will not be able to go to next step
    stepStatusSetter('undetermined');

    const setFormStatusFromValidationStatuses = ((validationStatuses: ValidationStatuses<WizardValues[Step]>) => {
      stepStatusSetter(mapValidationStatusesToOutcome(validationStatuses));
    }) as Dispatch<SetStateAction<PartialRecord<keyof WizardValues[Step], ValidationState | undefined>>>;
    /*
      Put function onto the queue. The action will be done only pending render is done
      In case of big step with many inputs, stepStatus will stay UNDETERMINED until that the render
      is done and only after that, the timeout will be run
     */
    setTimeout(() => addGlobalValidationStatusSubscriber(setFormStatusFromValidationStatuses), 0);

    return () => {
      setValuesGetterForCurrentStep(() => undefined);
      // On step switch, switch stepStatus, user will not be stuck on not clickable button
      stepStatusSetter('valid');
    };
  }, [stepStatusSetter, setValuesGetterForCurrentStep, addGlobalValidationStatusSubscriber]);

  useEffect(() => {
    setValuesGetterForCurrentStep(getFormValues);
  }, [getFormValues, setValuesGetterForCurrentStep]);

  return useMemo(
    () => ({
      form,
    }),
    [form],
  );
}
