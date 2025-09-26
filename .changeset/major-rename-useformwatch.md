---
"graneet-form": major
---

**Breaking Change**: Rename and unify `useOnBlurValues`, `useOnChangeValues` to `useFieldsWatch` for consistency

The hooks `useOnBlurValues` and `useOnChangeValues` have been unified into a single `useFieldsWatch` hook with a `mode` option for better consistency and API simplification.

**Migration Guide:**
```diff
- import { useOnChangeValues, useOnBlurValues } from 'graneet-form';
+ import { useFieldsWatch } from 'graneet-form';

- const values = useOnChangeValues(form, ['field1', 'field2']);
+ const values = useFieldsWatch(form, ['field1', 'field2']); // onChange by default

- const values = useOnBlurValues(form, ['field1', 'field2']);
+ const values = useFieldsWatch(form, ['field1', 'field2'], { mode: 'onBlur' });
```