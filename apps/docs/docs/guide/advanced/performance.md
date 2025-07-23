# Performance Guide

## Understanding Performance

graneet-form is designed with performance as a primary concern. This guide explains the performance characteristics and best practices for optimal performance.

## Key Performance Features

### 1. Subscription-Based Architecture

The library uses a subscription system that minimizes re-renders:

```tsx
// ✅ Only re-renders when 'email' changes
const { email } = useOnChangeValues(form, ['email']);

// ❌ Re-renders on any field change
const allValues = useOnChangeValues(form);
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
  const { firstName, lastName } = useOnChangeValues(form, ['firstName', 'lastName']);
  
  return <div>{firstName} {lastName}</div>;
}

// ❌ Bad - Watches all fields
function UserPreview() {
  const form = useFormContext<UserForm>();
  const values = useOnChangeValues(form); // Re-renders on any change
  
  return <div>{values.firstName} {values.lastName}</div>;
}
```

### 2. Choose the Right Watch Mode

Use `useOnBlurValues` for less critical updates:

```tsx
// For live previews - use onChange
const { search } = useOnChangeValues(form, ['search']);

// For validation summaries - use onBlur
const { email, password } = useOnBlurValues(form, ['email', 'password']);
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

## Performance Monitoring

### 1. React DevTools Profiler

Use React DevTools Profiler to identify performance bottlenecks:

1. Open React DevTools
2. Go to the Profiler tab
3. Record interactions with your form
4. Look for components with high render times or frequent re-renders

### 2. Custom Performance Hooks

Create hooks to monitor form performance:

```tsx
function useFormPerformance<T extends FieldValues>(form: FormContextApi<T>) {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(Date.now());

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    setLastRenderTime(Date.now());
  });

  const reset = () => {
    setRenderCount(0);
    setLastRenderTime(Date.now());
  };

  return { renderCount, lastRenderTime, reset };
}

// Usage
function PerformanceDebug() {
  const form = useFormContext();
  const { renderCount, reset } = useFormPerformance(form);

  return (
    <div>
      Renders: {renderCount}
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### 3. Bundle Size Monitoring

Track the impact of graneet-form on your bundle size:

```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer

# For Vite projects
npm install --save-dev rollup-plugin-visualizer
```

## Performance Comparison

### Large Forms (1000+ fields)

graneet-form maintains constant performance even with large forms:

```tsx
// This scales well even with many fields
function LargeForm() {
  const form = useForm<LargeFormData>();

  return (
    <Form form={form}>
      {Array.from({ length: 1000 }, (_, index) => (
        <Field
          key={index}
          name={`field_${index}` as any}
          render={({ value, onChange }) => (
            <input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        />
      ))}
    </Form>
  );
}
```

### Rapid Updates

The subscription system handles rapid updates efficiently:

```tsx
function SearchField() {
  const form = useFormContext();
  const { search } = useOnChangeValues(form, ['search']);

  // This updates on every keystroke but doesn't cause
  // performance issues thanks to the subscription system
  return (
    <Field
      name="search"
      render={({ value, onChange }) => (
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type to search..."
        />
      )}
    />
  );
}
```

## Memory Management

### 1. Automatic Cleanup

graneet-form automatically cleans up subscriptions and event listeners when components unmount. No manual cleanup required.

### 2. Avoiding Memory Leaks

```tsx
// ✅ Good - Form is created once and reused
function MyComponent() {
  const form = useForm<MyForm>();
  
  return <Form form={form}>...</Form>;
}

// ❌ Bad - Would create memory leaks (but hooks prevent this)
function MyComponent() {
  // This is actually safe due to React's hook rules,
  // but conceptually it's better to understand that
  // forms should be stable references
  
  return <Form form={useForm<MyForm>()}>...</Form>;
}
```

### 3. Large Dataset Handling

For forms with large datasets, consider virtualization:

```tsx
import { FixedSizeList as List } from 'react-window';

function VirtualizedFormFields({ items }: { items: Item[] }) {
  const renderItem = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <Field
        name={`item_${index}` as any}
        render={({ value, onChange }) => (
          <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      />
    </div>
  );

  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={50}
      itemData={items}
    >
      {renderItem}
    </List>
  );
}
```

## Performance Tips Summary

1. **Watch specific fields** - Use field arrays in watch hooks
2. **Choose appropriate watch modes** - onChange vs onBlur
3. **Debounce expensive operations** - Use `isDebounced` for async validation
4. **Memoize components** - Use React.memo for expensive components  
5. **Monitor performance** - Use React DevTools Profiler
6. **Keep validation simple** - Optimize validation functions
7. **Avoid global watchers** - Don't watch all fields unless necessary
8. **Use proper typing** - TypeScript helps with performance optimizations

Following these practices will ensure your forms remain performant even as they grow in complexity and size.