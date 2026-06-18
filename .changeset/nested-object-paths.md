---
'graneet-form': minor
---

Add nested object path support for field names

Field names can now target nested object properties using dotted paths (objects only — array indices are not supported).

**What's new**

- `<Field name="user.address.city" />` — `name` now accepts any path in the new `FieldPath<T>` type, and the rendered `value`/`onChange` are typed via `FieldPathValue<T, K>`.
- `getFormValues()` reconstructs a nested object, e.g. `{ user: { address: { city: 'Paris' } } }`.
- `setFormValues(...)` accepts a partial nested object (`DeepPartial<T>`), e.g. `setFormValues({ user: { address: { city: 'Paris' } } })`.
- `useFieldsWatch(form, ['user.address.city'])` and `useValidations(form, ['user'])` return reconstructed nested objects.
- **Hierarchical watching**: watching a parent path (`'user'`) re-renders and receives the rebuilt subtree whenever any descendant (`'user.address.city'`) changes, and vice-versa.

**Backward compatible**

`FieldPath<T>` is a superset of `keyof T`, so existing flat forms keep working and type-checking unchanged. Internally, field state is still stored flat (keyed by the full path string); nesting happens only at the read/write boundaries.

**New exported types**: `FieldPath`, `FieldPathValue`, `DeepPartial`.

**Limitations**: array index paths (`items.0.price`) are not supported; a field whose value is itself a plain object cannot coexist with nested paths under the same key; `setFormValues` is additive (it does not clear omitted leaves).
