import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AnyRecord } from '../../shared/types/any-record';
import type { FieldValues } from '../../shared/types/field-value';
import type { ValidationState } from '../../shared/types/validation';
import { useFormContext } from '../contexts/form-context';
import { RuleContext } from '../contexts/rule-context';
import { useFieldValidation } from '../hooks/use-field-validation';
import { useRules } from '../hooks/use-rules';

export interface FieldRenderProps<T extends FieldValues, K extends keyof T> {
  name: K;
  value: T[K] | undefined;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (e: T[K] | undefined) => void;
}

export interface FieldRenderState {
  /**
   * @deprecated Use `isTouched` or `isDirty` instead.
   * `isPristine` will be removed in a future major version.
   * Equivalent to `!isDirty`.
   */
  isPristine: boolean;
  /** `true` after the user has focused then blurred the field. Resets to `false` on `resetForm()`. */
  isTouched: boolean;
  /** `true` after the user has changed the field value. Resets to `false` on `resetForm()`. */
  isDirty: boolean;
  validationStatus: ValidationState;
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
  render: (fieldProps: FieldRenderProps<T, K>, fieldState: FieldRenderState) => ReactNode | null;

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
  data,
  defaultValue,
}: FieldProps<T, K>): ReactNode {
  const form = useFormContext<T>();
  const { ruleContext, rules, debouncedRules } = useRules();

  const [value, setValue] = useState<T[K] | undefined>();
  const [isTouched, setIsTouched] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const validationStatus = useFieldValidation(rules, debouncedRules, value);

  const hasFocusRef = useRef(false);

  useEffect(
    () =>
      form.formInternal.registerField(
        name,
        setValue,
        {
          onDirty: () => {
            setIsDirty(true);
          },
          onReset: () => {
            setIsTouched(false);
            setIsDirty(false);
          },
          onTouch: () => {
            setIsTouched(true);
          },
        },
        defaultValue,
      ),
    [name, form.formInternal, defaultValue],
  );

  useEffect(() => {
    form.formInternal.updateValidationStatus(name, validationStatus);
  }, [name, form.formInternal, validationStatus]);

  const onChange = useCallback(
    (newValue: T[K] | undefined): void => {
      form.formInternal.onFieldChange(name, newValue, hasFocusRef.current);
      setIsDirty(true);
    },
    [name, form.formInternal],
  );

  const onBlur = useCallback((): void => {
    if (hasFocusRef.current) {
      setIsTouched(true);
    }
    hasFocusRef.current = false;
    // oxlint-disable-next-line typescript/no-floating-promises
    form.formInternal.onFieldBlur(name, data);
  }, [name, form.formInternal, data]);

  const onFocus = useCallback(() => {
    hasFocusRef.current = true;
  }, []);

  return (
    <RuleContext value={ruleContext}>
      {render(
        {
          name,
          onBlur,
          onChange,
          onFocus,
          value,
        },
        {
          isDirty,
          isPristine: !isDirty,
          isTouched,
          validationStatus,
        },
      )}
      {children}
    </RuleContext>
  );
}
