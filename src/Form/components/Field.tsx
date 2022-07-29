import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AnyRecord,
  FieldValue,
  ValidationStatus,
} from '../../shared';
import { useFormContext } from '../contexts/FormContext';
import { useFieldValidation } from '../hooks/useFieldValidation';
import { useRules } from '../hooks/useRules';
import { RuleContext } from '../contexts/RuleContext';

export interface FieldRenderProps<T extends Record<string, FieldValue>, K extends keyof T> {
  name: K,
  value: T[K] | undefined,
  onFocus: () => void,
  onBlur: () => void,
  onChange: (e: T[K] | undefined) => void,
}

export interface FieldRenderState {
  isPristine: boolean,
  validationStatus: ValidationStatus,
}

export interface FieldProps<T extends Record<string, FieldValue>, K extends keyof T> {
  name: K,
  children?: ReactNode,
  render: (fieldProps: FieldRenderProps<T, K>, fieldState: FieldRenderState) => JSX.Element | null,
  data?: AnyRecord,
}

/**
 * Component to integrate a form content in the form system. Every components like input,
 * checkbox has to be rendered by this component
 * @param name - Name of the field, used as identifier
 * @param children Rules (optional)
 * @param render Function to render
 * @param data data transmitted to onUpdateAfterBlur
 * @example
 * ```
 * <Field
 *    name="foo"
 *    render={(props) => {
 *    const { onChange, ...rest } = props;
 *      return (<input {...rest} onChange={(e) => onChange(e.target.value)} />);
 *    }}
 *  >
 *    {children}
 * </Field>
 * ```
 */
export function Field<T extends Record<string, FieldValue>, K extends keyof T>({
  name,
  children = null,
  render,
  data = undefined,
}: FieldProps<T, K>) {
  const {
    formInternal: {
      registerField,
      unregisterField,
      handleOnChange: handleChange,
      handleOnBlur: handleBlur,
      updateValidationStatus,
    },
  } = useFormContext<T>();
  const {
    ruleContext,
    rules,
    debouncedRules,
  } = useRules();

  const [value, setValue] = useState<T[K] | undefined>(undefined);
  const [isPristine, setIsPristine] = useState<boolean>(true);
  const validationStatus = useFieldValidation(
    rules,
    debouncedRules,
    value,
  );

  const hasFocusRef = useRef(false);

  useEffect(() => {
    registerField(name, setValue);
    return () => unregisterField(name);
  }, [name, registerField, unregisterField]);

  useEffect(() => {
    if (isPristine && hasFocusRef.current) {
      setIsPristine(false);
    }
  }, [isPristine, value]);

  useEffect(() => {
    updateValidationStatus(name, validationStatus);
  }, [name, updateValidationStatus, validationStatus]);

  const onChange = useCallback((newValue: T[K] | undefined): void => {
    handleChange(name, newValue, hasFocusRef.current);
  }, [handleChange, name]);

  const onBlur = useCallback((): void => {
    hasFocusRef.current = false;
    handleBlur(name, data);
  }, [handleBlur, name, data]);

  const onFocus = useCallback(() => {
    hasFocusRef.current = true;
  }, []);

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

export function composeEventHandlers(
  originalEventHandler: (...args: unknown[]) => void,
  formEventHandler: (...args: unknown[]) => void,
) {
  return (
    (...args: unknown[]): void => {
      if (originalEventHandler) {
        originalEventHandler(...args);
      }

      formEventHandler(...args);
    }
  );
}
