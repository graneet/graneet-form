import {
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  FieldValues,
  mapValidationStatusesToOutcome,
  VALIDATION_OUTCOME,
  ValidationStatus,
  ValidationStatuses,
} from '../../shared';
import {
  FormContextApi,
  PublishSubscriber,
  useForm,
  UseFormOptions,
} from '../../Form';
import { useWizardContext } from '../contexts/WizardContext';

interface UseStepFormApi {
  form: FormContextApi,
  initFormValues: (initialValues: FieldValues) => void,
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
export function useStepForm(props: UseFormOptions): UseStepFormApi {
  const form = useForm(props);
  const {
    stepStatusSetter,
    setValuesGetterForCurrentStep,
    getValuesOfCurrentStep,
  } = useWizardContext();
  const valuesHasBeenInitializedRef = useRef(false);

  const { formInternal: { addValidationStatusSubscriber }, getFormValues, setFormValues } = form;

  useEffect(() => {
    // Form validation is async.
    // So by then, set step status to undefined, the user will not be able to go to next step
    stepStatusSetter(VALIDATION_OUTCOME.UNDETERMINED);

    const setFormStatusFromValidationStatuses = ((validationStatuses: ValidationStatuses) => {
      stepStatusSetter(mapValidationStatusesToOutcome(validationStatuses));
    }) as PublishSubscriber<ValidationStatus>;
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
    const valuesOfCurrentStep = getValuesOfCurrentStep();
    // If values for the current step are stored in the wizard context, we update values of the form
    // and set valuesHasBeenInitialized to true to detect if values getting has been done
    if (valuesOfCurrentStep) {
      valuesHasBeenInitializedRef.current = true;
      setFormValues(valuesOfCurrentStep);
    }
  }, [getValuesOfCurrentStep, setFormValues]);

  const initFormValues = useCallback((initialValues: FieldValues) : void => {
    // when values from the wizard has been gotten, the function do nothing
    if (!valuesHasBeenInitializedRef.current) {
      setFormValues(initialValues);
    }
  }, [setFormValues]);

  return { initFormValues, form };
}
