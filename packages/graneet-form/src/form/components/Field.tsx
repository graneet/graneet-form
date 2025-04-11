import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import type { AnyRecord } from '../../shared/types/AnyRecord';
import type { FieldValues } from '../../shared/types/FieldValue';
import type { ValidationStatus } from '../../shared/types/Validation';
import { CONTEXT_FORM_DEFAULT, useFormContext } from '../contexts/FormContext';
import { RuleContext } from '../contexts/RuleContext';
import { useFieldValidation } from '../hooks/useFieldValidation';
import { useRules } from '../hooks/useRules';

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
}: FieldProps<T, K>) {
  const form = useFormContext<T>();
  const { ruleContext, rules, debouncedRules } = useRules();

  const [value, setValue] = useState<T[K] | undefined>(undefined);
  const [isPristine, setIsPristine] = useState<boolean>(true);
  const validationStatus = useFieldValidation(rules, debouncedRules, value);

  const hasFocusRef = useRef(false);
  const hasBeenFocusedRef = useRef(false);

  useEffect(() => {
    return form.formInternal.registerField(name, setValue);
  }, [name, form.formInternal]);

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

  if (form === CONTEXT_FORM_DEFAULT) {
    throw new Error('No form context could be found.');
  }

  return (
    <RuleContext.Provider value={ruleContext}>
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
    </RuleContext.Provider>
  );
}

/**
 * @deprecated create your own one instead
 */
export function composeEventHandlers<Args extends unknown[]>(
  originalEventHandler: ((...args: Args) => void) | undefined,
  formEventHandler: (...args: Args) => void,
) {
  return async (...args: Args): Promise<void> => {
    if (originalEventHandler) {
      originalEventHandler(...args);
    }

    formEventHandler(...args);
  };
}
