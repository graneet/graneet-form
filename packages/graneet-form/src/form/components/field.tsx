import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import type { AnyRecord } from '../../shared/types/any-record';
import type { FieldValues } from '../../shared/types/field-value';
import type { ValidationStatus } from '../../shared/types/validation';
import { useFormContext } from '../contexts/form-context';
import { RuleContext } from '../contexts/rule-context';
import { useFieldValidation } from '../hooks/use-field-validation';
import { useRules } from '../hooks/use-rules';

export interface FieldRenderProps<T extends FieldValues, K extends keyof T> {
  name: K;
  value: T[K] | undefined;
  onFocus(): void;
  onBlur(): void;
  onChange(e: T[K] | undefined): void;
}

export interface FieldRenderState {
  isPristine: boolean;
  validationStatus: ValidationStatus;
}

export interface FieldProps<T extends FieldValues, K extends keyof T> {
  /**
   * The name of the field.
   */
  name: K;

  /**
   * Rules
   */
  children?: ReactNode;

  /**
   * The function used to render the field component
   */
  render(fieldProps: FieldRenderProps<T, K>, fieldState: FieldRenderState): ReactNode | null;

  data?: AnyRecord;

  defaultValue?: T[K];
}

/**
 * Represents a field in a form.
 * @example
 * ```tsx
 * <Field name="userName">
 *   {(fieldProps, fieldStatus) => (
 *     <input
 *        name={fieldProps.name}
 *        value={fieldProps.value || ''}
 *        onBlur={fieldProps.onBlur}
 *        onFocus={fieldProps.onFocus}
 *        onChange={(e) => fieldProps.onChange(e.target.value)}
 *     />
 *   )}
 * </Field>
 * ```
 */
export function Field<T extends FieldValues, K extends keyof T>({
  name,
  children = null,
  render,
  data = undefined,
  defaultValue,
}: FieldProps<T, K>) {
  const form = useFormContext<T>();
  const { ruleContext, rules, debouncedRules } = useRules();

  const [value, setValue] = useState<T[K] | undefined>(undefined);
  const [isPristine, setIsPristine] = useState<boolean>(true);
  const validationStatus = useFieldValidation(rules, debouncedRules, value);

  const hasFocusRef = useRef(false);
  const hasBeenFocusedRef = useRef(false);

  useEffect(() => {
    return form.formInternal.registerField(name, setValue, defaultValue);
  }, [name, form.formInternal, defaultValue]);

  useEffect(() => {
    form.formInternal.updateValidationStatus(name, validationStatus);
  }, [name, form.formInternal, validationStatus]);

  const onChange = useCallback(
    (newValue: T[K] | undefined): void => {
      form.formInternal.onFieldChange(name, newValue, hasFocusRef.current);

      if (hasBeenFocusedRef.current) {
        setIsPristine(false);
      }
    },
    [name, form.formInternal],
  );

  const onBlur = useCallback((): void => {
    hasFocusRef.current = false;
    form.formInternal.onFieldBlur(name, data);
  }, [name, form.formInternal, data]);

  const onFocus = useCallback(() => {
    hasFocusRef.current = true;
    hasBeenFocusedRef.current = true;
  }, []);

  return (
    <RuleContext value={ruleContext}>
      {render(
        {
          name,
          value,
          onFocus,
          onBlur,
          onChange,
        },
        {
          isPristine,
          validationStatus,
        },
      )}
      {children}
    </RuleContext>
  );
}
