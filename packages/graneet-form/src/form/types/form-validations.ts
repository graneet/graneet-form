import type { FieldPath, PathHead, PathTail } from '../../shared/types/field-path';
import type { FieldValues } from '../../shared/types/field-value';
import type { ValidationState } from '../../shared/types/validation';

/**
 * Builds the nested validation shape covering the watched path union `P`. Mirrors `NestedValues`
 * but every watched leaf resolves to a `ValidationState`.
 * @internal
 */
type NestedValidations<T, P extends string> = {
  [K in PathHead<P> & keyof T]?: [PathTail<P, K & string>] extends [never]
    ? ValidationState | undefined
    : NestedValidations<NonNullable<T[K]>, PathTail<P, K & string>>;
};

/**
 * The nested subset of validation statuses restricted to the watched paths `Keys`.
 *
 * @example
 * // T = { user: { address: { city: string } } }
 * FormValidations<T, 'user.address.city'> // { user?: { address?: { city?: ValidationState } } }
 */
export type FormValidations<T extends FieldValues, Keys extends FieldPath<T>> = NestedValidations<T, Keys & string>;
