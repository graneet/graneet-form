import { useCallback, useMemo, useState } from 'react';
import { RuleContextApi } from '../contexts/RuleContext';
import { Validator } from '../types/Validation';

export interface Rule {
  validatorFn: Validator;
  errorMessage: string;
}

type UseRules = {
  ruleContext: RuleContextApi;
  rules: Rule[];
  debouncedRules: Rule[];
};

export function useRules(): UseRules {
  const [rules, setRules] = useState<Rule[]>([]);
  const [debouncedRules, setDebouncedRules] = useState<Rule[]>([]);

  const registerRule = useCallback((testFn: Validator, errorMessage: string, isDebounced: boolean): void => {
    if (isDebounced) {
      setDebouncedRules((prev) => [...prev, { validatorFn: testFn, errorMessage }]);
    } else {
      setRules((prev) => [...prev, { validatorFn: testFn, errorMessage }]);
    }
  }, []);

  const unregisterRule = useCallback((testFn: Validator, isDebounced: boolean): void => {
    if (isDebounced) {
      setDebouncedRules((previousDebouncedRules) =>
        previousDebouncedRules.filter((rule) => rule.validatorFn !== testFn),
      );
    } else {
      setRules((previousRules) => previousRules.filter((rule) => rule.validatorFn !== testFn));
    }
  }, []);

  const ruleContext = useMemo(
    () => ({
      registerRule,
      unregisterRule,
    }),
    [registerRule, unregisterRule],
  );

  return useMemo(
    () => ({
      ruleContext,
      rules,
      debouncedRules,
    }),
    [debouncedRules, ruleContext, rules],
  );
}
