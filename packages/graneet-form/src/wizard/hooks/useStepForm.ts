import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef } from 'react';
import type { FormContextApi } from '../../form/contexts/FormContext';
import { type UseFormOptions, useForm } from '../../form/hooks/useForm';
import type { FieldValues } from '../../shared/types/FieldValue';
import type { PartialRecord } from '../../shared/types/PartialRecord';
import { VALIDATION_OUTCOME, type ValidationStatus, type ValidationStatuses } from '../../shared/types/Validation';
import { mapValidationStatusesToOutcome } from '../../shared/util/validation.util';
import { useWizardContext } from '../contexts/WizardContext';

interface UseStepFormApi<T extends FieldValues> {
  form: FormContextApi<T>;

  /**
   * @deprecated use defaultValues props instead
   * @param initialValues
   */
  initFormValues(initialValues: Partial<T>): void;
}

/**
 * Using Form in Wizard context. Data will be saved and get on step change.
 * @return UseStepFormApi
 * @example
 * ```
 * const {form, initFormValues} = useStepForm({
 *  defaultValues: {"foo": "foo", "bar": "bar"}
 * })
 *
 * return(
 *  <Form form={form}>
 *    <TextField name="foo" />
 *  </Form>
 * )
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
