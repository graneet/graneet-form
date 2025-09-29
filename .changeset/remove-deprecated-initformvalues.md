---
"graneet-form": major
---

Remove deprecated `initFormValues` from `useStepForm` hook

BREAKING CHANGE: The `initFormValues` method has been removed from the `useStepForm` hook. Use the `defaultValues` option instead for better performance and consistency.

Migration:
```typescript
// Before (deprecated)
const { initFormValues } = useStepForm();
initFormValues({ name: 'John', email: '' });

// After (recommended)
const { form } = useStepForm({
  defaultValues: { name: 'John', email: '' }
});
```