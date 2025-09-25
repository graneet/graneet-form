import { createContext, use } from 'react';
import type { Validator } from '../types/validation';

export interface RuleContextApi {
  registerRule(testFn: Validator, errorMessage: string, isDebounced: boolean): void;
  unregisterRule(testFn: Validator, isDebounced: boolean): void;
}

export const RuleContext = createContext<RuleContextApi | null>(null);
export const useRuleContext = (): RuleContextApi => {
  const context = use(RuleContext);

  if (!context) {
    throw new Error('useRuleContext must be defined');
  }

  return context;
};
