import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FieldValue,
  VALIDATION_OUTCOME,
  ValidationStatus,
} from '../../shared';
import {
  VALIDATION_STATE_UNDETERMINED,
  VALIDATION_STATE_VALID,
} from '../types/Validation';
import { Rule } from './useRules';

const DEBOUNCE_TIME = 500;

export function useFieldValidation(
  rules: Rule[],
  debouncedRules: Rule[],
  value: FieldValue,
): ValidationStatus {
  const numberOfRules = rules.length + debouncedRules.length;
  const [
    validationStatus,
    setValidationStatus,
  ] = useState<ValidationStatus>(
    numberOfRules
      ? VALIDATION_STATE_UNDETERMINED
      : VALIDATION_STATE_VALID,
  );
  const metaState = useRef({
    countRulesResolved: 0,
    phaseId: 0,
    hasError: false,
  });

  const testRules = useCallback((
    rulesToTest: Rule[],
    fieldValue: FieldValue,
    phaseId: number,
  ) => {
    rulesToTest.forEach(({ validatorFn, errorMessage }) => {
      if (metaState.current.hasError) {
        return;
      }
      Promise.resolve(validatorFn(fieldValue)).then((isValid) => {
        /*
          Ensure that the validation corresponds to the latest value with its
          matching phaseId.
          For example, if this loop is still running but phaseId has changed
          since, we do not update setValidationStatus
         */
        if (phaseId !== metaState.current.phaseId) {
          return;
        }
        metaState.current.countRulesResolved += 1;

        if (!isValid && !metaState.current.hasError) {
          throw new Error(errorMessage);
        }
        /*
          If we run the last rule, and no error was thrown,
          update status to VALIDATION_STATE_VALID
         */
        if (isValid && metaState.current.countRulesResolved === numberOfRules) {
          setValidationStatus(VALIDATION_STATE_VALID);
        }
      }).catch(({ message }) => {
        const status: ValidationStatus = { status: VALIDATION_OUTCOME.INVALID, message };
        metaState.current.hasError = true;
        setValidationStatus(status);
      });
    });
  }, [numberOfRules]);

  useEffect(() => {
    // When we don't have rules we do nothing
    if (!numberOfRules) {
      setValidationStatus(VALIDATION_STATE_VALID);
      return () => {};
    }
    setValidationStatus(VALIDATION_STATE_UNDETERMINED);

    const { current } = metaState;
    // On each render, we increment phaseId,
    // doing, so we ensure actions are done on right value
    current.phaseId += 1;
    current.countRulesResolved = 0;
    current.hasError = false;
    const currentPhaseId = current.phaseId;

    testRules(rules, value, currentPhaseId);
    const token = setTimeout(() => {
      testRules(debouncedRules, value, currentPhaseId);
    }, DEBOUNCE_TIME);
    return () => clearTimeout(token);
  }, [debouncedRules, numberOfRules, rules, testRules, value]);

  return validationStatus;
}
