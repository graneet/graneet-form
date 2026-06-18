import { useCallback, useMemo, useState } from 'react';
import type { RuleContextApi } from '../contexts/rule-context';
import type { Validator } from '../types/validation';

interface IRule {
  validatorFn: Validator;
  errorMessage: string;
}

interface UseRules {
  ruleContext: RuleContextApi;
  rules: IRule[];
  debouncedRules: IRule[];
}

function useRules(): UseRules {
  const [rules, setRules] = useState<IRule[]>([]);
  const [debouncedRules, setDebouncedRules] = useState<IRule[]>([]);

  const registerRule = useCallback((testFn: Validator, errorMessage: string, isDebounced: boolean): void => {
    if (isDebounced) {
      setDebouncedRules((prev) => [...prev, { errorMessage, validatorFn: testFn }]);
    } else {
      setRules((prev) => [...prev, { errorMessage, validatorFn: testFn }]);
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
      debouncedRules,
      ruleContext,
      rules,
    }),
    [debouncedRules, ruleContext, rules],
  );
}

export type { IRule };
export { useRules };
