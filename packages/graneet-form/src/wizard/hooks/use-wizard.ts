import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FieldValues } from '../../shared/types/field-value';
import type { PartialRecord } from '../../shared/types/partial-record';
import type { VALIDATION_OUTCOME } from '../../shared/types/validation';
import type { ValidationStatusesSetter, WizardContextApi } from '../contexts/wizard-context';
import type { StepValidator } from '../types/step-validator';

type StepConfig<WizardValues extends Record<string, FieldValues>, Step extends keyof WizardValues> = {
  name: Step;
  onNext?: StepValidator<WizardValues, Step>;
};

export type Steps<WizardValues extends Record<string, FieldValues>> = {
  [K in keyof WizardValues]: StepConfig<WizardValues, K>;
}[keyof WizardValues][];

export function useWizard<WizardValues extends Record<string, FieldValues> = Record<string, Record<string, unknown>>>(
  steps: Steps<WizardValues>,
  onFinish: (wizardValues: WizardValues) => void | Promise<void> = () => {},
  onQuit: () => void = () => {},
): WizardContextApi<WizardValues> {
  // -- VALUES --
  const wizardValuesRef = useRef<WizardValues>({} as WizardValues);
  const valuesStepGetterRef = useRef<() => FieldValues | undefined>(() => undefined);

  // -- STEPS --
  const [currentStep, setCurrentStep] = useState<keyof WizardValues>();

  const [isStepReady, setIsStepReady] = useState(false);

  const stepStatusSetterRef = useRef<Set<ValidationStatusesSetter>>(new Set());

  // -- UTILS --
  const hasPreviousStep = useCallback((index: number) => index - 1 >= 0, []);

  const hasNextStep = useCallback(
    (index: number, listOfSteps: Steps<WizardValues>) => index + 1 <= listOfSteps.length - 1,
    [],
  );

  const saveValuesOfCurrentStepInWizardValues = useCallback(() => {
    // Add form values to values stored in the wizard
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

  const goBackTo = useCallback<WizardContextApi<WizardValues>['goBackTo']>(
    (previousStep) => {
      if (!currentStep) {
        return;
      }

      const currentStepIndex = steps.findIndex((v) => v.name === currentStep);
      const targetStepIndex = steps.findIndex((v) => v.name === previousStep);

      if (currentStepIndex > targetStepIndex) {
        setIsStepReady(false);
        saveValuesOfCurrentStepInWizardValues();
        setTimeout(() => setCurrentStep(steps[targetStepIndex].name), 0);
      }
    },
    [currentStep, saveValuesOfCurrentStepInWizardValues, steps],
  );

  const goNext = useCallback<WizardContextApi<WizardValues>['goNext']>(async (): Promise<void> => {
    if (!currentStep) {
      return;
    }

    const onNext = steps.find((v) => v.name === currentStep)?.onNext;

    // Make validation for the step if one is declared
    if (onNext) {
      const isStepValid = await onNext(valuesStepGetterRef.current() as WizardValues[keyof WizardValues]);
      if (!isStepValid) {
        return;
      }
    }
    saveValuesOfCurrentStepInWizardValues();

    const index = steps.findIndex((v) => v.name === currentStep);
    // If it has next step, go to next step
    if (hasNextStep(index, steps)) {
      setIsStepReady(false);
      // Ensure that current step change is done after isStepReady
      setTimeout(() => setCurrentStep(steps[index + 1].name), 0);
      return;
    }
    await onFinish(wizardValuesRef.current);
  }, [currentStep, hasNextStep, onFinish, saveValuesOfCurrentStepInWizardValues, steps]);

  const goPrevious = useCallback<WizardContextApi<WizardValues>['goPrevious']>((): void => {
    if (!currentStep) {
      return;
    }
    if (currentStep) {
      const index = steps.findIndex((v) => v.name === currentStep);
      if (hasPreviousStep(index)) {
        setIsStepReady(false);

        saveValuesOfCurrentStepInWizardValues();
        setTimeout(() => setCurrentStep(steps[index - 1].name), 0);
        return;
      }
      onQuit();
    }
  }, [currentStep, hasPreviousStep, onQuit, saveValuesOfCurrentStepInWizardValues, steps]);

  const registerStepStatusListener = useCallback<
    WizardContextApi<WizardValues>['wizardInternal']['registerStepStatusListener']
  >((stepStatusSetter: ValidationStatusesSetter): void => {
    stepStatusSetterRef.current.add(stepStatusSetter);
  }, []);

  const unregisterStepStatusListener = useCallback<
    WizardContextApi<WizardValues>['wizardInternal']['unregisterStepStatusListener']
  >((stepStatusSetter: ValidationStatusesSetter): void => {
    stepStatusSetterRef.current.delete(stepStatusSetter);
  }, []);

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
        registerStepStatusListener,
        unregisterStepStatusListener,
        stepStatusSetter,
        setIsStepReady,
        setValuesGetterForCurrentStep,
      },
      steps: steps.map((step) => step.name),
      currentStep,
      goNext,
      goPrevious,
      goBackTo,
      isStepReady,
      getValuesOfCurrentStep,
      getValuesOfStep,
      getValuesOfSteps,
      get isLastStep() {
        return !steps.length || currentStep === steps[steps.length - 1].name;
      },
      get isFirstStep() {
        return !steps.length || currentStep === steps[0].name;
      },
    }),
    [
      registerStepStatusListener,
      unregisterStepStatusListener,
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
