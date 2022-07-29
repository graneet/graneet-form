import React, {
  ReactNode,
} from 'react';
import { FieldValue } from '../../shared';
import { Field } from './Field';

interface HiddenFieldProps<T extends Record<string, FieldValue>, K extends keyof T> {
  name: K & string,
  children?: ReactNode,
}

/**
 * HiddenField, need to be used with useHiddenField hook
 * @param name - Field name
 * @param children - Rules (optional)
 * @example
 * ```
 * const fooHiddenField = useHiddenField('foo');
 * return (
 *  <HiddenField {...fooHiddenField} />
 * )
 * ```
 */
export function HiddenField<T extends Record<string, FieldValue>, K extends keyof T>({
  children = null,
  ...props
}: HiddenFieldProps<T, K>) {
  return (
    <Field {...props} render={() => null}>
      {children}
    </Field>
  );
}
