import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { FieldValues, VALIDATION_OUTCOME } from '../../shared';
import { ValidationStatusesSetter, WizardContextApi } from '../contexts/WizardContext';
import { PlaceholderContent, PlaceholderContentSetter, StepValidator } from '../types';
import { PartialRecord } from '../../shared/types/PartialRecord';

export function useWizard<WizardValues extends Record<string, FieldValues>>(
  onFinish: (wizardValues: WizardValues) => void,
  onQuit: () => void,
): WizardContextApi<WizardValues> {
  // -- VALUES --
  const wizardValuesRef = useRef<WizardValues>({} as WizardValues);
  const valuesStepGetterRef = useRef<() => FieldValues | undefined>(() => undefined);

  // -- STEP --
  const [currentStep, setCurrentStep] = useState<keyof WizardValues>();
  const [steps, setSteps] = useState<Array<keyof WizardValues>>([]);
  const validationFnsRef = useRef<PartialRecord<keyof WizardValues, StepValidator<WizardValues, any>>>({});
  const stepsWithoutFooterRef = useRef<Set<keyof WizardValues>>(new Set());
  const [isStepReady, setIsStepReady] = useState(false);

  // -- PLACEHOLDER --
  const placeholderContentSetterRef = useRef<Set<PlaceholderContentSetter>>(new Set());
  const stepStatusSetterRef = useRef<Set<ValidationStatusesSetter>>(new Set());

  // -- TITLE --
  const titlesRef = useRef<{ name: keyof WizardValues; title: string | undefined }[]>([]);

  // -- UTILS --
  const hasPreviousStep = (index: number) => index - 1 >= 0;
  const hasNextStep = useCallback(
    (index: number, listOfSteps: Array<keyof WizardValues>) => index + 1 <= listOfSteps.length - 1,
    [],
  );
  const saveValuesOfCurrentStepInWizardValues = useCallback(() => {
    // Add form values to values stored in wizard
    if (currentStep) {
      // add values only if getter returns values
      const stepValues = valuesStepGetterRef.current();
      if (stepValues) {
        wizardValuesRef.current[currentStep] = stepValues as WizardValues[keyof WizardValues];
      }
    }
  }, [currentStep]);

  // -- API --

  /**
   * Get values for specified step
   */
  const getValuesOfStep = useCallback(
    <Step extends keyof WizardValues>(step: Step): WizardValues[Step] | undefined => wizardValuesRef.current[step],
    [],
  );

  /**
   * Get values for the current step
   */
  const getValuesOfCurrentStep = useCallback(
    <Step extends keyof WizardValues>(): WizardValues[Step] | undefined =>
      currentStep ? (getValuesOfStep(currentStep) as WizardValues[Step]) : undefined,
    [currentStep, getValuesOfStep],
  );

  /**
   * Get values for all the steps
   */
  const getValuesOfSteps = useCallback((): WizardValues => wizardValuesRef.current, []);

  /**
   * Register step in the Wizard
   * @param name Step name
   * @param validationFn (optional) Function trigger on onClick click
   * @param noFooter If not specified, footer is displayed
   */
  const registerStep = useCallback(
    <Step extends keyof WizardValues>(
      name: Step,
      validationFn?: StepValidator<WizardValues, Step>,
      noFooter?: boolean,
      title?: string,
    ): void => {
      // Current step is the first step registered
      setSteps((previous) => {
        if (previous.indexOf(name) !== -1) {
          throw new Error(`Attempting to register step "${String(name)}" a second time`);
        }

        if (previous.length === 0) {
          setCurrentStep(name);
        }
        return [...previous, name];
      });

      // Add validation function
      if (validationFn) {
        validationFnsRef.current[name] = validationFn;
      }
      if (noFooter) {
        stepsWithoutFooterRef.current.add(name);
      }
      titlesRef.current = [...titlesRef.current, { name, title }];
    },
    [],
  );

  /**
   * Unregister step in the Wizard
   * @param name Step name
   */
  const unregisterStep = useCallback(
    (name: keyof WizardValues): void => {
      setSteps((previous) => {
        const index = previous.indexOf(name);
        if (index === -1) {
          throw new Error(`No step ${String(name)} to be unregistered was found.`);
        }

        /*
      There is 3 cases when we unregister step on currentStep:
        - If there is a previous step: this step is the new current
        - Else is there is a next step: this step is the new current
        - Else, current step is undefined
       */
        let newCurrentStep: keyof WizardValues;
        // There is a previous step, the current step is index - 1
        if (hasPreviousStep(index)) {
          newCurrentStep = previous[index - 1];
          // Else, there is a next step, the current step is index + 1
        } else if (hasNextStep(index, previous)) {
          newCurrentStep = previous[index + 1];
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setCurrentStep(newCurrentStep);
        return [...previous.slice(0, index), ...previous.slice(index + 1)];
      });

      delete validationFnsRef.current[name];
      stepsWithoutFooterRef.current.delete(name);
      titlesRef.current = titlesRef.current.filter(({ name: currentName }) => currentName !== name);
    },
    [hasNextStep],
  );

  /**
   * Go to the next step if there is one or run onFinish function
   */
  const handleOnNext = useCallback(async (): Promise<void> => {
    if (!currentStep) {
      return;
    }
    // Make validation for the step if one is declared
    if (validationFnsRef.current[currentStep]) {
      const isStepValid = await validationFnsRef.current[currentStep]!(getValuesOfCurrentStep());
      if (!isStepValid) {
        return;
      }
    }
    saveValuesOfCurrentStepInWizardValues();

    const index = steps.indexOf(currentStep);
    // If it has next step, go to next step
    if (hasNextStep(index, steps)) {
      setIsStepReady(false);
      // Ensure that current step change is done after isStepReady
      setTimeout(() => setCurrentStep(steps[index + 1]), 0);
      return;
    }
    await onFinish(wizardValuesRef.current);
  }, [currentStep, getValuesOfCurrentStep, hasNextStep, onFinish, saveValuesOfCurrentStepInWizardValues, steps]);

  /**
   * Go to the previous step if there is one or run onQuit function
   */
  const handleOnPrevious = useCallback((): void => {
    if (!currentStep) {
      return;
    }
    if (currentStep) {
      const index = steps.indexOf(currentStep);
      if (hasPreviousStep(index)) {
        setIsStepReady(false);

        saveValuesOfCurrentStepInWizardValues();
        setTimeout(() => setCurrentStep(steps[index - 1]), 0);
        return;
      }
      onQuit();
    }
  }, [currentStep, onQuit, saveValuesOfCurrentStepInWizardValues, steps]);

  /**
   * Register a placeholder
   * @param placeholderContentSetter Setter to update placeholder content
   * @param validationStatusesSetter Setter to update placeholder validations
   */
  const registerPlaceholder = useCallback(
    (placeholderContentSetter: PlaceholderContentSetter, stepStatusSetter: ValidationStatusesSetter): void => {
      placeholderContentSetterRef.current.add(placeholderContentSetter);
      stepStatusSetterRef.current.add(stepStatusSetter);
    },
    [],
  );

  /**
   * Unregister a placeholder
   */
  const unregisterPlaceholder = useCallback(
    (placeholderContentSetter: PlaceholderContentSetter, stepStatusSetter: ValidationStatusesSetter): void => {
      placeholderContentSetterRef.current.delete(placeholderContentSetter);
      stepStatusSetterRef.current.delete(stepStatusSetter);
    },
    [],
  );

  /**
   * Set component in the placeholder
   * @param placement Placement of the element added
   * @param children Component to add
   */
  const updatePlaceholderContent = useCallback((placement: string, children: ReactNode): void => {
    placeholderContentSetterRef.current.forEach((placeholderContentSetter) => {
      placeholderContentSetter((previous: PlaceholderContent) => ({ ...previous, [placement]: children }));
    });
  }, []);

  /**
   * Reset content of placeholder
   * @param placement Placement of the element deleted
   */
  const resetPlaceholderContent = useCallback(
    (placement?: string): void => {
      if (placement) {
        updatePlaceholderContent(placement, undefined);
      } else {
        placeholderContentSetterRef.current.forEach((placeholderContentSetter) => {
          placeholderContentSetter({} as PlaceholderContent);
        });
      }
    },
    [updatePlaceholderContent],
  );

  /**
   * Set values
   * @param key Label key
   */
  const setValuesGetterForCurrentStep = useCallback(
    <Step extends keyof WizardValues>(stepValuesGetter: () => WizardValues[Step] | undefined): void => {
      valuesStepGetterRef.current = stepValuesGetter;
    },
    [],
  );

  /**
   * Update step status in all placeholders
   */
  const stepStatusSetter = useCallback((status: VALIDATION_OUTCOME) => {
    stepStatusSetterRef.current.forEach((stepStatusSetterFunc) => {
      stepStatusSetterFunc(status);
    });
  }, []);

  return useMemo<WizardContextApi<WizardValues>>(
    () =>
      Object.defineProperties(
        {
          wizardInternal: {
            updatePlaceholderContent,
            resetPlaceholderContent,
            registerStep,
            unregisterStep,
            registerPlaceholder,
            unregisterPlaceholder,
            stepStatusSetter,
            setIsStepReady,
            setValuesGetterForCurrentStep,
          },
          steps,
          currentStep,
          handleOnNext,
          handleOnPrevious,
          isStepReady,
          getValuesOfCurrentStep,
          getValuesOfStep,
          getValuesOfSteps,
        } as WizardContextApi<WizardValues>,
        {
          isLastStep: {
            get() {
              return !steps.length || currentStep === steps[steps.length - 1];
            },
          },
          isFirstStep: {
            get() {
              return !steps.length || currentStep === steps[0];
            },
          },
          hasNoFooter: {
            get() {
              return currentStep && stepsWithoutFooterRef.current.has(currentStep);
            },
          },
          stepsTitles: {
            get() {
              return titlesRef.current;
            },
          },
        },
      ),
    [
      steps,
      currentStep,
      registerStep,
      unregisterStep,
      handleOnNext,
      handleOnPrevious,
      updatePlaceholderContent,
      resetPlaceholderContent,
      registerPlaceholder,
      unregisterPlaceholder,
      stepStatusSetter,
      isStepReady,
      setValuesGetterForCurrentStep,
      getValuesOfCurrentStep,
      getValuesOfStep,
      getValuesOfSteps,
    ],
  );
}
