import type { ChildPaths, FieldPath } from '../../shared/types/field-path';
import type { FieldValues } from '../../shared/types/field-value';

/**
 * Unconstrained nested projection: builds the nested object shape covering the watched path
 * union `Keys`. A key is kept when it is exactly watched (leaf → its value type) or when a
 * descendant path is watched (recurse into it).
 * @internal
 */
type NestedValues<T, Keys extends string> = {
  [K in keyof T & string as K extends Keys ? K : ChildPaths<Keys, K> extends never ? never : K]?: K extends Keys
    ? T[K] | undefined
    : NestedValues<NonNullable<T[K]>, ChildPaths<Keys, K>>;
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
