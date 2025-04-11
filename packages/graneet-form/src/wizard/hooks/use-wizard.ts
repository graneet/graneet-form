import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import type { FieldValues } from '../../shared/types/field-value';
import type { PartialRecord } from '../../shared/types/partial-record';
import type { VALIDATION_OUTCOME } from '../../shared/types/validation';
import type { ValidationStatusesSetter, WizardContextApi } from '../contexts/wizard-context';
import type { PlaceholderContent, PlaceholderContentSetter } from '../types/placeholder-content';
import type { StepValidator } from '../types/step-validator';

export function useWizard<WizardValues extends Record<string, FieldValues> = Record<string, Record<string, unknown>>>(
  onFinish: (wizardValues: WizardValues) => void | Promise<void>,
  onQuit: () => void,
): WizardContextApi<WizardValues> {
  // -- VALUES --
  const wizardValuesRef = useRef<WizardValues>({} as WizardValues);
  const valuesStepGetterRef = useRef<() => FieldValues | undefined>(() => undefined);

  // -- STEP --
  const [currentStep, setCurrentStep] = useState<keyof WizardValues>();
  const [steps, setSteps] = useState<Array<keyof WizardValues>>([]);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const validationFnsRef = useRef<PartialRecord<keyof WizardValues, StepValidator<WizardValues, any>>>({});

  const stepsWithoutFooterRef = useRef<Set<keyof WizardValues>>(new Set());
  const [isStepReady, setIsStepReady] = useState(false);

  // -- PLACEHOLDER --
  const placeholderContentSetterRef = useRef<Set<PlaceholderContentSetter>>(new Set());
  const stepStatusSetterRef = useRef<Set<ValidationStatusesSetter>>(new Set());

  // -- TITLE --
  const titlesRef = useRef<{ name: keyof WizardValues; title: string | undefined }[]>([]);

  // -- UTILS --
  const hasPreviousStep = useCallback((index: number) => index - 1 >= 0, []);

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

  const getValuesOfStep = useCallback<WizardContextApi<WizardValues>['getValuesOfStep']>(
    <Step extends keyof WizardValues>(step: Step): WizardValues[Step] | undefined => wizardValuesRef.current[step],
    [],
  );

  const getValuesOfCurrentStep = useCallback<WizardContextApi<WizardValues>['getValuesOfCurrentStep']>(
    <Step extends keyof WizardValues>(): WizardValues[Step] | undefined =>
      currentStep ? (getValuesOfStep(currentStep) as WizardValues[Step]) : undefined,
    [currentStep, getValuesOfStep],
  );

  const getValuesOfSteps = useCallback<WizardContextApi<WizardValues>['getValuesOfSteps']>(
    (): WizardValues => wizardValuesRef.current,
    [],
  );

  const registerStep = useCallback<WizardContextApi<WizardValues>['wizardInternal']['registerStep']>(
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

  const unregisterStep = useCallback<WizardContextApi<WizardValues>['wizardInternal']['unregisterStep']>(
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
        // @ts-ignore
        setCurrentStep(newCurrentStep);
        return [...previous.slice(0, index), ...previous.slice(index + 1)];
      });

      delete validationFnsRef.current[name];
      stepsWithoutFooterRef.current.delete(name);
      titlesRef.current = titlesRef.current.filter(({ name: currentName }) => currentName !== name);
    },
    [hasNextStep, hasPreviousStep],
  );

  const goBackTo = useCallback<WizardContextApi<WizardValues>['goBackTo']>(
    (previousStep) => {
      if (!currentStep) {
        return;
      }

      const currentStepIndex = steps.indexOf(currentStep);
      const targetStepIndex = steps.indexOf(previousStep);

      if (currentStepIndex > targetStepIndex) {
        setIsStepReady(false);
        saveValuesOfCurrentStepInWizardValues();
        setTimeout(() => setCurrentStep(steps[targetStepIndex]), 0);
      }
    },
    [currentStep, saveValuesOfCurrentStepInWizardValues, steps],
  );

  const goNext = useCallback<WizardContextApi<WizardValues>['goNext']>(async (): Promise<void> => {
    if (!currentStep) {
      return;
    }
    // Make validation for the step if one is declared
    if (validationFnsRef.current[currentStep]) {
      const isStepValid = await validationFnsRef.current[currentStep](
        valuesStepGetterRef.current() as WizardValues[keyof WizardValues],
      );
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
  }, [currentStep, hasNextStep, onFinish, saveValuesOfCurrentStepInWizardValues, steps]);

  const goPrevious = useCallback<WizardContextApi<WizardValues>['goPrevious']>((): void => {
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
  }, [currentStep, hasPreviousStep, onQuit, saveValuesOfCurrentStepInWizardValues, steps]);

  const registerPlaceholder = useCallback<WizardContextApi<WizardValues>['wizardInternal']['registerPlaceholder']>(
    (placeholderContentSetter: PlaceholderContentSetter, stepStatusSetter: ValidationStatusesSetter): void => {
      placeholderContentSetterRef.current.add(placeholderContentSetter);
      stepStatusSetterRef.current.add(stepStatusSetter);
    },
    [],
  );

  const unregisterPlaceholder = useCallback<WizardContextApi<WizardValues>['wizardInternal']['unregisterPlaceholder']>(
    (placeholderContentSetter: PlaceholderContentSetter, stepStatusSetter: ValidationStatusesSetter): void => {
      placeholderContentSetterRef.current.delete(placeholderContentSetter);
      stepStatusSetterRef.current.delete(stepStatusSetter);
    },
    [],
  );

  const updatePlaceholderContent = useCallback<
    WizardContextApi<WizardValues>['wizardInternal']['updatePlaceholderContent']
  >((placement: string, children: ReactNode): void => {
    for (const placeholderContentSetter of placeholderContentSetterRef.current) {
      placeholderContentSetter((previous: PlaceholderContent) => ({
        ...previous,
        [placement]: children,
      }));
    }
  }, []);

  const resetPlaceholderContent = useCallback<
    WizardContextApi<WizardValues>['wizardInternal']['resetPlaceholderContent']
  >(
    (placement?: string): void => {
      if (placement) {
        updatePlaceholderContent(placement, undefined);
      } else {
        for (const placeholderContentSetter of placeholderContentSetterRef.current) {
          placeholderContentSetter({} as PlaceholderContent);
        }
      }
    },
    [updatePlaceholderContent],
  );

  const setValuesGetterForCurrentStep = useCallback<
    WizardContextApi<WizardValues>['wizardInternal']['setValuesGetterForCurrentStep']
  >(<Step extends keyof WizardValues>(stepValuesGetter: () => WizardValues[Step] | undefined): void => {
    valuesStepGetterRef.current = stepValuesGetter;
  }, []);

  const stepStatusSetter = useCallback<WizardContextApi<WizardValues>['wizardInternal']['stepStatusSetter']>(
    (status: VALIDATION_OUTCOME) => {
      for (const stepStatusSetterFunc of stepStatusSetterRef.current) {
        stepStatusSetterFunc(status);
      }
    },
    [],
  );

  return useMemo<WizardContextApi<WizardValues>>(
    () => ({
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
      handleOnNext: goNext,
      goNext,
      handleOnPrevious: goPrevious,
      goPrevious,
      handleGoBackTo: goBackTo,
      goBackTo: goBackTo,
      isStepReady,
      getValuesOfCurrentStep,
      getValuesOfStep,
      getValuesOfSteps,
      get isLastStep() {
        return !steps.length || currentStep === steps[steps.length - 1];
      },
      get isFirstStep() {
        return !steps.length || currentStep === steps[0];
      },
      get hasNoFooter() {
        return !!currentStep && stepsWithoutFooterRef.current.has(currentStep);
      },
      get stepsTitles() {
        return titlesRef.current;
      },
    }),
    [
      updatePlaceholderContent,
      resetPlaceholderContent,
      registerStep,
      unregisterStep,
      registerPlaceholder,
      unregisterPlaceholder,
      stepStatusSetter,
      setValuesGetterForCurrentStep,
      steps,
      currentStep,
      goNext,
      goPrevious,
      goBackTo,
      isStepReady,
      getValuesOfCurrentStep,
      getValuesOfStep,
      getValuesOfSteps,
    ],
  );
}
