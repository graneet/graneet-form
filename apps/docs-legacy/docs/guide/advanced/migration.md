# Migration Guide

## Migrating from React Hook Form

If you're coming from React Hook Form, this guide will help you migrate to graneet-form.

### Basic Form Setup

**React Hook Form:**
```tsx
import { useForm, Controller } from 'react-hook-form';

function MyForm() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        rules={{ required: 'Email is required' }}
        render={({ field }) => (
          <input {...field} type="email" />
        )}
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

**graneet-form:**
```tsx
import { useForm, Form, Field, Rule } from 'graneet-form';

interface FormData {
  email: string;
  password: string;
}

function MyForm() {
  const form = useForm<FormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleSubmit = () => {
    const values = form.getFormValues();
    console.log(values);
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Field
        name="email"
        render={({ value, onChange, onBlur }, { validationStatus, isPristine }) => (
          <div>
            <input
              type="email"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
            />
            {!isPristine && validationStatus.status === 'invalid' && (
              <span>{validationStatus.message}</span>
            )}
          </div>
        )}
      >
        <Rule validationFn={(value) => !!value} message="Email is required" />
      </Field>
      
      <button type="submit">Submit</button>
    </Form>
  );
}
```

### Key Differences

| Feature | React Hook Form | graneet-form |
|---------|----------------|--------------|
| **Field Registration** | `register()` or `Controller` | `Field` component with render prop |
| **Validation** | `rules` prop or schema | `Rule` components as children |
| **Error Handling** | `formState.errors` | `validationStatus` in render prop |
| **Value Watching** | `watch()` | `useFieldsWatch()` with `mode` option |
| **Form State** | `formState` | `useFormStatus()` |
| **Field Arrays** | `useFieldArray()` | Manual array management with form values |

### Validation Migration

**React Hook Form validation:**
```tsx
<Controller
  name="email"
  control={control}
  rules={{
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  }}
  render={({ field }) => <input {...field} />}
/>
```

**graneet-form validation:**
```tsx
<Field
  name="email"
  render={({ value, onChange, onBlur }) => (
    <input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  )}
>
  <Rule
    validationFn={(value) => !!value}
    message="Email is required"
  />
  <Rule
    validationFn={(value) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value || '')}
    message="Invalid email address"
  />
</Field>
```

### Watching Values

**React Hook Form:**
```tsx
const emailValue = watch('email');
const allValues = watch();

// With subscription
useEffect(() => {
  const subscription = watch((value, { name }) => {
    console.log(name, value);
  });
  return () => subscription.unsubscribe();
}, [watch]);
```

**graneet-form:**
```tsx
const { email } = useFieldsWatch(form, ['email']); // onChange by default
const allValues = useFieldsWatch(form);

// Automatic subscription management - no manual cleanup needed
const { email } = useFieldsWatch(form, ['email'], { mode: 'onBlur' }); // For less frequent updates
```

## Migrating from Formik

### Basic Form

**Formik:**
```tsx
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short').required('Required'),
});

function MyForm() {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      <Form>
        <Field name="email" type="email" />
        <ErrorMessage name="email" component="div" />
        
        <Field name="password" type="password" />
        <ErrorMessage name="password" component="div" />
        
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  );
}
```

**graneet-form:**
```tsx
import { useForm, Form, Field, Rule } from 'graneet-form';

interface FormData {
  email: string;
  password: string;
}

function MyForm() {
  const form = useForm<FormData>({
    defaultValues: { email: '', password: '' }
  });

  const handleSubmit = () => {
    const values = form.getFormValues();
    console.log(values);
  };

  const isValidEmail = (email: string) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

  const isMinLength = (value: string) => {
    return (value || '').length >= 6;
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Field
        name="email"
        render={({ value, onChange, onBlur }, { validationStatus, isPristine }) => (
          <div>
            <input
              type="email"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
            />
            {!isPristine && validationStatus.status === 'INVALID' && (
              <div>{validationStatus.message}</div>
            )}
          </div>
        )}
      >
        <Rule validationFn={(value) => !!value} message="Required" />
        <Rule validationFn={isValidEmail} message="Invalid email" />
      </Field>

      <Field
        name="password"
        render={({ value, onChange, onBlur }, { validationStatus, isPristine }) => (
          <div>
            <input
              type="password"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
            />
            {!isPristine && validationStatus.status === 'invalid' && (
              <div>{validationStatus.message}</div>
            )}
          </div>
        )}
      >
        <Rule validationFn={(value) => !!value} message="Required" />
        <Rule validationFn={isMinLength} message="Too short" />
      </Field>

      <button type="submit">Submit</button>
    </Form>
  );
}
```

### Key Differences

| Feature | Formik | graneet-form |
|---------|--------|--------------|
| **Initial Values** | `initialValues` prop | `defaultValues` in `useForm()` |
| **Validation** | `validationSchema` or `validate` | `Rule` components |
| **Field Components** | `<Field>` component | `<Field>` with render prop |
| **Error Display** | `<ErrorMessage>` | Validation status in render prop |
| **Submission** | `onSubmit` prop | `onSubmit` in `<Form>` |

## Migration Strategies

### 1. Gradual Migration

You can migrate forms one at a time:

```tsx
// Keep existing Formik forms
import { FormikForm } from './old/FormikForm';

// Add new graneet-form forms
import { GraneetForm } from './new/GraneetForm';

function App() {
  return (
    <div>
      {/* Old form */}
      <FormikForm />
      
      {/* New form */}
      <GraneetForm />
    </div>
  );
}
```

### 2. Create Wrapper Components

Create wrapper components to ease migration:

```tsx
// Wrapper to mimic React Hook Form Controller
function ControlledField<T extends FieldValues, K extends keyof T>({ 
  name, 
  render, 
  rules = [] 
}: {
  name: K;
  render: (props: { field: { value: T[K]; onChange: (value: T[K]) => void } }) => React.ReactNode;
  rules?: Array<{ validate: (value: T[K]) => boolean; message: string }>;
}) {
  return (
    <Field
      name={name}
      render={({ value, onChange }) => 
        render({ 
          field: { 
            value, 
            onChange 
          } 
        })
      }
    >
      {rules.map((rule, index) => (
        <Rule
          key={index}
          validationFn={rule.validate}
          message={rule.message}
        />
      ))}
    </Field>
  );
}

// Usage
<ControlledField
  name="email"
  rules={[
    { validate: (value) => !!value, message: 'Required' }
  ]}
  render={({ field }) => (
    <input {...field} type="email" />
  )}
/>
```

### 3. Validation Helper Functions

Create helper functions to convert validation schemas:

```tsx
// Convert Yup-like validation to graneet-form rules
function createValidationRules(schema: {
  required?: { value: boolean; message: string };
  minLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
}) {
  const rules: Array<{ validationFn: (value: any) => boolean; message: string }> = [];

  if (schema.required) {
    rules.push({
      validationFn: (value) => !!value,
      message: schema.required!.message
    });
  }

  if (schema.minLength) {
    rules.push({
      validationFn: (value) => (value || '').length >= schema.minLength!.value,
      message: schema.minLength!.message
    });
  }

  if (schema.pattern) {
    rules.push({
      validationFn: (value) => schema.pattern!.value.test(value || ''),
      message: schema.pattern!.message
    });
  }

  return rules;
}

// Usage
const emailRules = createValidationRules({
  required: { value: true, message: 'Email is required' },
  pattern: { 
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
    message: 'Invalid email' 
  }
});
```

## Common Pitfalls

### 1. Missing onBlur Handler

**Problem**: Validation not triggering
```tsx
// ❌ Missing onBlur
<Field
  name="email"
  render={({ value, onChange }) => (
    <input value={value || ''} onChange={(e) => onChange(e.target.value)} />
  )}
>
  <Rule validationFn={isRequired} message="Required" />
</Field>
```

**Solution**: Include onBlur
```tsx
// ✅ Include onBlur for validation
<Field
  name="email"
  render={({ value, onChange, onBlur }) => (
    <input 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  )}
>
  <Rule validationFn={isRequired} message="Required" />
</Field>
```

### 2. Incorrect TypeScript Usage

**Problem**: Type errors with field names
```tsx
// ❌ String literals instead of typed keys
const values = useFieldsWatch(form, ['nonExistentField']);
```

**Solution**: Proper typing
```tsx
// ✅ Properly typed field names
interface FormData {
  email: string;
  password: string;
}

const values = useFieldsWatch(form, ['email', 'password']); // Type-safe
```

### 3. Performance Issues

**Problem**: Watching all fields unnecessarily
```tsx
// ❌ Causes unnecessary re-renders
const allValues = useFieldsWatch(form);
```

**Solution**: Watch specific fields
```tsx
// ✅ Only watch needed fields
const { email, name } = useFieldsWatch(form, ['email', 'name']);
```

## Benefits After Migration

1. **Better Performance**: Subscription-based updates reduce re-renders
2. **Type Safety**: Strong TypeScript integration
3. **Wizard Support**: Built-in multi-step form capabilities  
4. **Simpler API**: Unified `useFieldsWatch` hook with mode options
5. **Better Developer Experience**: Clear separation of concerns
6. **Zero Dependencies**: No external validation libraries needed