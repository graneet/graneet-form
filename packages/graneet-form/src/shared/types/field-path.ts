import type { FieldValues } from './field-value';

/** `true` if `V` is exactly `any` (avoids conditional types exploding into both branches). */
type IsAny<V> = 0 extends 1 & V ? true : false;

/**
 * Whether a value can be descended into for nested path generation.
 * Objects only: arrays, `Date`, functions and `any` are treated as leaves.
 */
type IsNestable<V> =
  IsAny<V> extends true
    ? false
    : V extends readonly unknown[]
      ? false
      : V extends Date
        ? false
        : // oxlint-disable-next-line typescript/no-explicit-any
          V extends (...args: any[]) => any
          ? false
          : V extends object
            ? true
            : false;

/**
 * Union of all valid dotted field paths for `T` (objects only, no array indices).
 * Includes intermediate paths, e.g. for `{ user: { address: { city: string } } }`:
 * `'user' | 'user.address' | 'user.address.city'`.
 *
 * Because every top-level key is also a valid path, `FieldPath<T>` is a superset of
 * `keyof T & string`, so existing flat usage keeps type-checking.
 */
export type FieldPath<T> = T extends FieldValues
  ? {
      [K in keyof T & string]: IsNestable<T[K]> extends true ? K | `${K}.${FieldPath<NonNullable<T[K]>>}` : K;
    }[keyof T & string]
  : string;

/** Resolve the value type located at dotted path `P` within `T`. */
export type FieldPathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? FieldPathValue<NonNullable<T[K]>, Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

/** Remaining path under key `K` for every member of the path union `P` (e.g. `P='user.city', K='user'` → `'city'`). */
export type ChildPaths<P extends string, K extends string> = P extends `${K}.${infer Rest}` ? Rest : never;
