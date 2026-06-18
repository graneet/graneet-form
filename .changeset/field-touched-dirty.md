---
'graneet-form': minor
---

Add `isTouched` and `isDirty` field state, deprecate `isPristine`

**New field state properties**

`FieldRenderState` now exposes two distinct interaction flags:

- `isTouched` — becomes `true` when the user has focused then blurred the field. Resets to `false` on `resetForm()`.
- `isDirty` — becomes `true` when the user has changed the field value. Resets to `false` on `resetForm()`.

**Deprecation**

`isPristine` is now deprecated and will be removed in the next major version. It is kept for backwards compatibility as an alias for `!isDirty`. Migrate by replacing `!fieldState.isPristine` with `fieldState.isTouched` (to show errors after blur) or `fieldState.isDirty` (to track value changes).

**`setFormValues` options**

`setFormValues` now accepts a second optional argument to control field interaction state programmatically:

```ts
setFormValues({ email: 'foo@bar.com' }, { shouldDirty: true, shouldTouch: true });
```

- `shouldDirty` — marks the updated fields as dirty. Default: `false`.
- `shouldTouch` — marks the updated fields as touched. Default: `false`.

The `SetFormValuesOptions` type is exported from the package.

**Bug fix**

`isPristine` (and now `isTouched`/`isDirty`) correctly resets to its initial state when `resetForm()` is called. Previously, `isPristine` would remain `false` after a form reset.
