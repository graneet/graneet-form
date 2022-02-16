import { ReactNode, useEffect } from 'react';
import { useRuleContext } from '../contexts/RuleContext';
import { Validator } from '../types/Validation';

interface RuleProps {
  validationFn: Validator,
  message: string,
  children?: ReactNode,
  isDebounced?: boolean,
}

/**
 *
 * @param message - Message when error is true
 * @param children -  Children
 * @param validationFn - Function run for the validation
 * @param isDebounced - Is validation function run with debounce
 * @example
 * ```
 * <TextField name="foo">
 *  <Rule
 *    message="REQUIRED"
 *    validationFn={(value) => !!value && value !== ''}
 *  />
 * </TextField>
 * ```
 */
export function Rule({
  message, children, validationFn, isDebounced = false,
}: RuleProps) {
  const { registerRule, unregisterRule } = useRuleContext();

  useEffect(() => {
    registerRule(validationFn, message, isDebounced);
    return () => unregisterRule(validationFn, isDebounced);
  }, [isDebounced, message, registerRule, unregisterRule, validationFn]);

  return children;
}

Rule.defaultProps = {
  children: null,
  isDebounced: false,
};
