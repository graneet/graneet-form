/**
 * Recursively makes all properties of `T` optional, stopping at non-plain values
 * (arrays, `Date`, functions are kept as-is). Used for `setFormValues` so nested objects
 * can be updated partially, e.g. `setFormValues({ user: { address: { city: 'X' } } })`.
 */
export type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends Date
    ? T
    : // oxlint-disable-next-line typescript/no-explicit-any
      T extends (...args: any[]) => any
      ? T
      : T extends object
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : T;
