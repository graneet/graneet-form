# Performance Guide

## Understanding Performance

graneet-form is designed with performance as a primary concern. This guide explains the performance characteristics and best practices for optimal performance.

## Key Performance Features

### 1. Subscription-Based Architecture

The library uses a subscription system that minimizes re-renders:

```tsx
// ✅ Only re-renders when 'email' changes
const { email } = useFieldsWatch(form, ['email']);

// ❌ Re-renders on any field change
const allValues = useFieldsWatch(form);
```

### 2. Field-Level Isolation

Each field is isolated and only re-renders when its own value or validation changes:

```tsx
function EmailField() {
  // This component only re-renders when email field changes
  return (
    <Field
      name="email"
      render={({ value, onChange }) => (
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )}
    />
  );
}

function NameField() {
  // This component only re-renders when name field changes
  return (
    <Field
      name="name"
      render={({ value, onChange }) => (
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )}
    />
  );
}
```

### 3. Debounced Global Updates

Global form updates are debounced to prevent excessive re-renders during rapid changes.

## Performance Best Practices

### 1. Use Specific Field Watching

Always specify which fields you need to watch:

```tsx
// ✅ Good - Only watches specific fields
function UserPreview() {
  const form = useFormContext<UserForm>();
  const { firstName, lastName } = useFieldsWatch(form, ['firstName', 'lastName']);
  
  return <div>{firstName} {lastName}</div>;
}

// ❌ Bad - Watches all fields
function UserPreview() {
  const form = useFormContext<UserForm>();
  const values = useFieldsWatch(form); // Re-renders on any change
  
  return <div>{values.firstName} {values.lastName}</div>;
}
```

### 2. Choose the Right Watch Mode

Use `useFieldsWatch`  with blur mode for less critical updates:

```tsx
// For live previews - use onChange (default)
const { search } = useFieldsWatch(form, ['search']);

// For validation summaries - use onBlur
const { email, password } = useFieldsWatch(form, ['email', 'password'], { mode: 'onBlur' });
```

### 3. Optimize Validation Functions

Keep validation functions simple and fast:

```tsx
// ✅ Fast validation
const isRequired = (value: unknown): boolean => {
  return value != null && value !== '';
};

// ❌ Slow validation (synchronous)
const isValidEmail = (email: string): boolean => {
  // Expensive regex or complex logic
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ✅ Better approach for expensive validation
const isValidEmail = useMemo(() => (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}, []);
```

### 4. Use Debounced Async Validation

For expensive async operations, always use debouncing:

```tsx
<Rule
  validationFn={checkEmailAvailability}
  message="Email is already taken"
  isDebounced // This prevents rapid API calls
/>
```

### 5. Memoize Complex Components

Use React.memo for complex field components:

```tsx
const ComplexFieldComponent = React.memo<FieldProps>(({ name }) => {
  return (
    <Field
      name={name}
      render={({ value, onChange }) => (
        <ComplexInput value={value} onChange={onChange} />
      )}
    />
  );
});
```

### 6. Minimize Context Dependencies

Avoid accessing the entire form context when you only need specific data:

```tsx
// ✅ Good - Only subscribes to needed data
function SubmitButton() {
  const form = useFormContext();
  const { isValid } = useFormStatus(form);
  
  return <button disabled={!isValid}>Submit</button>;
}

// ❌ Bad - Accesses form methods unnecessarily
function SubmitButton() {
  const form = useFormContext();
  const values = form.getFormValues(); // This might cause unnecessary updates
  
  return <button disabled={!Object.keys(values).length}>Submit</button>;
}
```

## Performance Tips Summary

1. **Watch specific fields** - Use field arrays in watch hooks
2. **Choose appropriate watch modes** - onChange vs onBlur
3. **Debounce expensive operations** - Use `isDebounced` for async validation
4. **Memoize components** - Use React.memo for expensive components  

Following these practices will ensure your forms remain performant even as they grow in complexity and size.