import { createContext, useContext } from 'react';
import type { Validator } from '../types/validation';

export interface RuleContextApi {
  registerRule(testFn: Validator, errorMessage: string, isDebounced: boolean): void;
  unregisterRule(testFn: Validator, isDebounced: boolean): void;
}

export const CONTEXT_RULE_DEFAULT: RuleContextApi = {
  registerRule: () => {},
  unregisterRule: () => {},
};

export const RuleContext = createContext(CONTEXT_RULE_DEFAULT);
export const useRuleContext = (): RuleContextApi => useContext(RuleContext);
