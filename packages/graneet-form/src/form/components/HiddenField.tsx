import type { ReactNode } from 'react';
import type { FieldValues } from '../../shared/types/FieldValue';
import { Field } from './Field';

interface HiddenFieldProps<T extends FieldValues, K extends keyof T> {
  /**
   * The name of the field.
   */
  name: K;

  /**
   * Rules
   */
  children?: ReactNode;
}

/**
 * A function component that renders a form field that is hidden from the user.
 * @example
 * ```tsx
 * // Import the component
 * import {HiddenField} from './HiddenField';
 *
 * // Define form field values type
 * interface FormFieldValues {
 *  field1: string;
 *  field2: number;
 * }
 *
 * // Usage
 * <HiddenField<FormFieldValues, 'field1'>
 *  name="field1"
 *  id="hidden-field"
 * />
 * ```
 * @deprecated create you custom hidden field instead
 */
export function HiddenField<T extends FieldValues, K extends keyof T = keyof T>({
  children = null,
  ...props
}: HiddenFieldProps<T, K>) {
  return (
    <Field<T, K> {...props} render={() => null}>
      {children}
    </Field>
  );
}
