import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from 'react';
import { FieldValues, mapValidationStatusesToOutcome, VALIDATION_OUTCOME, ValidationStatuses } from '../../shared';
import { FormContextApi, FormValidations, useForm, UseFormOptions } from '../../form';
import { useWizardContext } from '../contexts/WizardContext';

interface UseStepFormApi<T extends FieldValues> {
  form: FormContextApi<T>;
  initFormValues: (initialValues: Partial<T>) => void;
}

/**
 * Using Form in Wizard context. Data will be save and get on step change.
 * @return UseStepFormApi
 * @example
 * ```
 * const {form, initFormValues} = useStepForm()
 *
 * useEffect(() => {
 *   // If data is stored in wizard, this will not set data
 *   initFormValues({"foo": "foo", "bar": "bar"})
 * },[]);
 *
 * return(
 *  <Form form={form}>
 *    <TextField name="foo" />
 *  </Form>
 * )
 * ```
 */
export function useStepForm<T extends FieldValues>(props: UseFormOptions<T>): UseStepFormApi<T> {
  const form = useForm(props);
  const { stepStatusSetter, setValuesGetterForCurrentStep, getValuesOfCurrentStep } = useWizardContext();
  const valuesHasBeenInitializedRef = useRef(false);

  const {
    formInternal: { addValidationStatusSubscriber },
    getFormValues,
    setFormValues,
  } = form;

  useEffect(() => {
    // Form validation is async.
    // So by then, set step status to undefined, the user will not be able to go to next step
    stepStatusSetter(VALIDATION_OUTCOME.UNDETERMINED);

    const setFormStatusFromValidationStatuses = ((validationStatuses: ValidationStatuses<T>) => {
      stepStatusSetter(mapValidationStatusesToOutcome(validationStatuses));
    }) as Dispatch<SetStateAction<FormValidations<T, keyof T>>>;
    /*
      Put function onto the queue. The action will be done only pending render is done
      In case of big step with many inputs, stepStatus will stay UNDETERMINED until that the render
      is done and only after that, the timeout will be run
     */
    setTimeout(() => addValidationStatusSubscriber(setFormStatusFromValidationStatuses), 0);

    return () => {
      setValuesGetterForCurrentStep(() => undefined);
      // On step switch, switch stepStatus, user will not be stuck on not clickable button
      stepStatusSetter(VALIDATION_OUTCOME.VALID);
    };
  }, [stepStatusSetter, setValuesGetterForCurrentStep, addValidationStatusSubscriber]);

  useEffect(() => {
    setValuesGetterForCurrentStep(getFormValues);
  }, [getFormValues, setValuesGetterForCurrentStep]);

  useEffect(() => {
    const valuesOfCurrentStep = getValuesOfCurrentStep() as Partial<T>;
    // If values for the current step are stored in the wizard context, we update values of the form
    // and set valuesHasBeenInitialized to true to detect if values getting has been done
    if (valuesOfCurrentStep) {
      valuesHasBeenInitializedRef.current = true;
      setFormValues(valuesOfCurrentStep);
    }
  }, [getValuesOfCurrentStep, setFormValues]);

  const initFormValues = useCallback(
    (initialValues: Partial<T>): void => {
      // when values from the wizard has been gotten, the function do nothing
      if (!valuesHasBeenInitializedRef.current) {
        setFormValues(initialValues);
      }
    },
    [setFormValues],
  );

  return { initFormValues, form };
}
