import React, {
  ReactNode,
} from 'react';
import { Field } from './Field';

interface HiddenFieldProps {
  name: string,
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
export function HiddenField({
  children = null,
  ...props
}: HiddenFieldProps) {
  return (
    <Field {...props} render={() => null}>
      {children}
    </Field>
  );
}
