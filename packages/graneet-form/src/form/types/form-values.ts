import type { FieldPath, PathHead, PathTail } from '../../shared/types/field-path';
import type { FieldValues } from '../../shared/types/field-value';

/**
 * Builds the nested object shape covering the watched path union `P`. Only the watched branches are
 * present: each path segment is followed down to its leaf, where the value resolves to `T[leaf]`.
 */
type NestedValues<T, P extends string> = {
  [K in PathHead<P> & keyof T]?: [PathTail<P, K & string>] extends [never]
    ? T[K] | undefined
    : NestedValues<NonNullable<T[K]>, PathTail<P, K & string>>;
};

/**
 * The nested subset of form values restricted to the watched paths `Keys`.
 *
 * @example
 * // T = { user: { address: { city: string } }; email: string }
 * FormValues<T, 'user.address.city'> // { user?: { address?: { city?: string } } }
 * FormValues<T, 'user'>              // { user?: { address: { city: string } } }
 */
export type FormValues<T extends FieldValues, Keys extends FieldPath<T>> = NestedValues<T, Keys & string>;
