import type { ChildPaths, FieldPath } from '../../shared/types/field-path';
import type { FieldValues } from '../../shared/types/field-value';
import type { ValidationState } from '../../shared/types/validation';

/**
 * Unconstrained nested projection of validation statuses over the watched path union `Keys`.
 * Mirrors `FormValues` but every watched leaf resolves to a `ValidationState`.
 * @internal
 */
type NestedValidations<T, Keys extends string> = {
  [K in keyof T & string as K extends Keys ? K : ChildPaths<Keys, K> extends never ? never : K]?: K extends Keys
    ? ValidationState | undefined
    : NestedValidations<NonNullable<T[K]>, ChildPaths<Keys, K>>;
};

/**
 * The nested subset of validation statuses restricted to the watched paths `Keys`.
 *
 * @example
 * // T = { user: { address: { city: string } } }
 * FormValidations<T, 'user.address.city'> // { user?: { address?: { city?: ValidationState } } }
 */
export type FormValidations<T extends FieldValues, Keys extends FieldPath<T>> = NestedValidations<T, Keys & string>;
