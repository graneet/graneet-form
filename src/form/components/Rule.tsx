import { useEffect } from 'react';
import { useRuleContext } from '../contexts/RuleContext';
import { Validator } from '../types/Validation';

interface RuleProps {
  /**
   * Function run for the validation
   */
  validationFn: Validator;
  /**
   * Message displayed when error is true
   */
  message: string;
  /**
   * Is validation function run with debounce
   */
  isDebounced?: boolean;
}

/**
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
export function Rule({ message, validationFn, isDebounced = false }: RuleProps) {
  const { registerRule, unregisterRule } = useRuleContext();

  useEffect(() => {
    registerRule(validationFn, message, isDebounced);
    return () => unregisterRule(validationFn, isDebounced);
  }, [isDebounced, message, registerRule, unregisterRule, validationFn]);

  return null;
}
