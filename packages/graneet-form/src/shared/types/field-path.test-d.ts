import { describe, expectTypeOf, it } from 'vitest';
import type { FieldPath, FieldPathByValue } from './field-path';

describe('FieldPathByValue<T, V>', () => {
  it('selects flat and nested paths whose value is assignable to V', () => {
    type T = { name: string; age: number; user: { email: string } };

    expectTypeOf<FieldPathByValue<T, string>>().toEqualTypeOf<'name' | 'user.email'>();
  });

  it('matches the documented example with a nullable value type', () => {
    type T = { name: string; age: number; user: { email: string } };

    expectTypeOf<FieldPathByValue<T, string | null | undefined>>().toEqualTypeOf<'name' | 'user.email'>();
  });

  it('selects paths by a numeric value type', () => {
    type T = { name: string; age: number; address: { zip: number; city: string } };

    expectTypeOf<FieldPathByValue<T, number>>().toEqualTypeOf<'age' | 'address.zip'>();
  });

  it('resolves to never when no path matches', () => {
    type T = { name: string; age: number };

    expectTypeOf<FieldPathByValue<T, boolean>>().toEqualTypeOf<never>();
  });

  it('selects an intermediate object path when it is assignable to V', () => {
    type T = { user: { email: string } };

    // The whole `user` object matches, and so does the nested leaf.
    expectTypeOf<FieldPathByValue<T, { email: string }>>().toEqualTypeOf<'user'>();
    expectTypeOf<FieldPathByValue<T, string>>().toEqualTypeOf<'user.email'>();
  });

  it('treats arrays and Date as leaves', () => {
    type T = { tags: string[]; createdAt: Date; meta: { count: number } };

    expectTypeOf<FieldPathByValue<T, string[]>>().toEqualTypeOf<'tags'>();
    expectTypeOf<FieldPathByValue<T, Date>>().toEqualTypeOf<'createdAt'>();
  });

  it('distinguishes optional values from required ones', () => {
    type T = { required: string; optional?: string };

    // `optional` resolves to `string | undefined`, which is not assignable to `string`.
    expectTypeOf<FieldPathByValue<T, string>>().toEqualTypeOf<'required'>();
    expectTypeOf<FieldPathByValue<T, string | undefined>>().toEqualTypeOf<'required' | 'optional'>();
  });

  it('descends through multiple levels of nesting', () => {
    type T = { a: { b: { c: string; d: number } } };

    expectTypeOf<FieldPathByValue<T, string>>().toEqualTypeOf<'a.b.c'>();
    expectTypeOf<FieldPathByValue<T, number>>().toEqualTypeOf<'a.b.d'>();
  });

  it('stays a pure subset of FieldPath (the Extract wrapper is display-only, not filtering)', () => {
    // `FieldPathByValue` wraps the mapped type in `Extract<FieldPath<T> & string, …>` purely so
    // error messages expand to the union of valid paths instead of the alias name. `Extract` is a
    // no-op on the value here (the mapped type is already a subset of `FieldPath<T>`), so every
    // resolved path must remain a valid `FieldPath<T>`. This guards against the wrapper ever
    // narrowing or widening the result.
    type T = { name: string; age: number; user: { email: string } };

    expectTypeOf<FieldPathByValue<T, string>>().toExtend<FieldPath<T>>();
    expectTypeOf<FieldPathByValue<T, number>>().toExtend<FieldPath<T>>();
  });
});
