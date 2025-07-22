# Components API Reference

## Form Components

### Form

The main wrapper component for forms. Provides form context to child components.

```tsx
interface FormProps<T extends FieldValues> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: ReactNode;
  form: FormContextApi<T>;
  onSubmit?: () => void;
}
```

**Props:**
- `children` - Child components (Fields, Rules, etc.)
- `form` - Form context from `useForm`
- `onSubmit` - Custom submit handler
- All standard HTML form attributes except `onSubmit`

**Example:**
```tsx
function MyForm() {
  const form = useForm<FormValues>();

  const handleSubmit = () => {
    const values = form.getFormValues();
    console.log('Form submitted:', values);
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Field
        name="email"
        render={({ value, onChange }) => (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

### Field

A generic field component that uses the render prop pattern for maximum flexibility.

```tsx
interface FieldProps<T extends FieldValues, K extends keyof T> {
  name: K;
  children?: ReactNode; // Rules
  render(fieldProps: FieldRenderProps<T, K>, fieldState: FieldRenderState): ReactNode | null;
  data?: AnyRecord;
  defaultValue?: T[K];
}

interface FieldRenderProps<T, K> {
  name: K;
  value: T[K] | undefined;
  onFocus(): void;
  onBlur(): void;
  onChange(value: T[K] | undefined): void;
}

interface FieldRenderState {
  isPristine: boolean;
  validationStatus: ValidationStatus;
}
```

**Props:**
- `name` - Field name (must match form type)
- `render` - Render function that receives field props and state
- `children` - Validation rules (Rule components)
- `data` - Additional data passed to `onUpdateAfterBlur` callback
- `defaultValue` - Default value for the field

**Example:**
```tsx
<Field
  name="username"
  defaultValue="admin"
  data={{ userId: 123 }}
  render={({ value, onChange, onBlur, onFocus }, { isPristine, validationStatus }) => (
    <div>
      <input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        className={validationStatus.status === 'INVALID' ? 'error' : ''}
      />
      {!isPristine && validationStatus.status === 'INVALID' && (
        <span className="error-message">{validationStatus.message}</span>
      )}
    </div>
  )}
>
  <Rule validationFn={isRequired} message="Username is required" />
</Field>
```

### Rule

A validation rule component that defines field validation logic.

```tsx
interface RuleProps {
  validationFn: Validator;
  message: string;
  isDebounced?: boolean;
}

type Validator = (value: FieldValue) => boolean | Promise<boolean>;
```

**Props:**
- `validationFn` - Validation function that returns true if valid
- `message` - Error message to display when validation fails
- `isDebounced` - Whether to debounce validation (useful for async validation)

**Example:**
```tsx
// Sync validation
const isRequired = (value: unknown): boolean => {
  return value != null && value !== '';
};

// Async validation
const isUniqueEmail = async (email: string): Promise<boolean> => {
  const response = await fetch('/api/check-email', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
  return response.ok;
};

<Field name="email" render={...}>
  <Rule validationFn={isRequired} message="Email is required" />
  <Rule
    validationFn={isUniqueEmail}
    message="Email already exists"
    isDebounced
  />
</Field>
```

## Wizard Components

### Step

A component representing a single step in a wizard flow.

```tsx
interface StepProps<WizardValues extends Record<string, FieldValues>, Step extends keyof WizardValues> {
  children: ReactNode;
  name: Step;
  onNext?: StepValidator<WizardValues, Step>;
  noFooter?: boolean;
  title?: string;
}

type StepValidator<WizardValues, Step> = (
  stepValues: WizardValues[Step] | undefined
) => boolean | Promise<boolean>;
```

**Props:**
- `children` - Form fields and other content for the step
- `name` - Step identifier (must match wizard type)
- `onNext` - Custom validation function called before proceeding to next step
- `noFooter` - Disable the default navigation footer
- `title` - Step title (displayed in step header)

**Example:**
```tsx
function PersonalInfoStep() {
  const { form } = useStepForm<WizardData, 'personal'>();

  const validatePersonalInfo = async (values: WizardData['personal']) => {
    return values?.firstName && values?.lastName;
  };

  return (
    <Step
      name="personal"
      title="Personal Information"
      onNext={validatePersonalInfo}
    >
      <Field
        name="firstName"
        render={({ value, onChange }) => (
          <input
            placeholder="First Name"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      >
        <Rule validationFn={isRequired} message="First name is required" />
      </Field>
      
      <Field
        name="lastName"
        render={({ value, onChange }) => (
          <input
            placeholder="Last Name"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      >
        <Rule validationFn={isRequired} message="Last name is required" />
      </Field>
    </Step>
  );
}
```

### Custom Step Navigation

When using `noFooter={true}`, you can implement custom navigation:

```tsx
<Step name="custom" title="Custom Step" noFooter>
  <div className="step-content">
    {/* Your form fields */}
  </div>
  
  <div className="custom-footer">
    <button
      onClick={wizard.goPrevious}
      disabled={wizard.isFirstStep}
      className="btn-secondary"
    >
      Back
    </button>
    
    <button
      onClick={wizard.goNext}
      disabled={!wizard.isStepReady}
      className="btn-primary"
    >
      {wizard.isLastStep ? 'Complete' : 'Continue'}
    </button>
  </div>
</Step>
```

## Context Providers

### WizardContext

Provides wizard context to child components. Usually used with `WizardContext.Provider`.

```tsx
import { WizardContext } from 'graneet-form';

function MyWizard() {
  const wizard = useWizard<WizardData>(onFinish, onQuit);

  return (
    <WizardContext.Provider value={wizard}>
      <PersonalInfoStep />
      <ContactInfoStep />
      <SummaryStep />
    </WizardContext.Provider>
  );
}
```

## Component Patterns

### Reusable Field Components

Create reusable field components by wrapping the Field component:

```tsx
interface TextInputProps<T extends FieldValues, K extends keyof T> {
  name: K;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

function TextInput<T extends FieldValues, K extends keyof T>({
  name,
  placeholder,
  type = 'text',
  required = false
}: TextInputProps<T, K>) {
  return (
    <Field
      name={name}
      render={({ value, onChange, onBlur, onFocus }, { validationStatus, isPristine }) => (
        <div className="form-field">
          <input
            type={type}
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            className={
              !isPristine && validationStatus.status === 'INVALID' ? 'error' : ''
            }
          />
          {!isPristine && validationStatus.status === 'INVALID' && (
            <span className="error-message">{validationStatus.message}</span>
          )}
        </div>
      )}
    >
      {required && <Rule validationFn={isRequired} message={`${String(name)} is required`} />}
    </Field>
  );
}

// Usage
<TextInput<FormValues, 'email'> name="email" type="email" required />
```

### Conditional Fields

Show/hide fields based on other field values:

```tsx
function ConditionalFields() {
  const form = useFormContext<FormValues>();
  const { accountType } = useOnChangeValues(form, ['accountType']);

  return (
    <>
      <Field name="accountType" render={...} />
      
      {accountType === 'business' && (
        <Field name="companyName" render={...} />
      )}
      
      {accountType === 'personal' && (
        <Field name="dateOfBirth" render={...} />
      )}
    </>
  );
}
```