# Components API Reference

Complete reference for all components provided by graneet-form, based on JSDoc documentation from the source code.

## Core Form Components

### `Form`

The main wrapper component for forms that provides form context to child components.

```tsx
interface FormProps<T extends FieldValues> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: ReactNode;
  form: FormContextApi<T>;
  onSubmit?: () => void;
}
```

This component establishes the form context that allows child Field components to register themselves and access form state management functions.

#### Props

- **`children: ReactNode`** - Child components (Field, Rule components, or any other React elements)
- **`form: FormContextApi<T>`** - Form context instance from `useForm` hook
- **`onSubmit?: () => void`** - Optional custom submit handler
- **All standard HTML form attributes except `onSubmit`** - Supports className, style, id, etc.

#### Examples

**Basic form with submission:**
```tsx
function UserRegistrationForm() {
  const form = useForm<{
    email: string;
    password: string;
    confirmPassword: string;
  }>();

  const handleSubmit = form.handleSubmit(async (formData) => {
    try {
      await registerUser(formData);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error('Registration failed');
    }
  });

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      <Form form={form}>
        <Field
          name="email"
          render={({ value, onChange, onBlur, onFocus }) => (
            <input
              type="email"
              placeholder="Email"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              onFocus={onFocus}
            />
          )}
        >
          <Rule
            validationFn={(email) => !!email && email.includes('@')}
            message="Valid email is required"
          />
        </Field>

        <Field
          name="password"
          render={({ value, onChange, onBlur, onFocus }) => (
            <input
              type="password"
              placeholder="Password"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              onFocus={onFocus}
            />
          )}
        >
          <Rule
            validationFn={(pwd) => !!pwd && pwd.length >= 8}
            message="Password must be at least 8 characters"
          />
        </Field>

        <button type="submit">Register</button>
      </Form>
    </form>
  );
}
```

**Form with custom styling and validation display:**
```tsx
function StyledForm() {
  const form = useForm<{ message: string }>();
  const { formStatus } = useFormStatus(form);

  return (
    <Form 
      form={form} 
      className={`styled-form ${formStatus.toLowerCase()}`}
      style={{ padding: '20px', borderRadius: '8px' }}
    >
      <div className="form-header">
        <h2>Contact Form</h2>
        <div className={`status-indicator ${formStatus.toLowerCase()}`}>
          {formStatus}
        </div>
      </div>
      
      <Field name="message" render={/* field render */} />
    </Form>
  );
}
```

---

### `Field`

Represents a field in a form using the render prop pattern for maximum flexibility.

```tsx
interface FieldProps<T extends FieldValues, K extends keyof T> {
  name: K;
  children?: ReactNode; // Rules and other child components
  render(fieldProps: FieldRenderProps<T, K>, fieldState: FieldRenderState): ReactNode | null;
  data?: AnyRecord;
  defaultValue?: T[K];
}
```

The Field component automatically:
- Registers itself with the form when mounted
- Unregisters when unmounted
- Manages field state and validation
- Provides field props and state to the render function

#### Props

- **`name: K`** - The field name (must match form type keys)
- **`render: (fieldProps, fieldState) => ReactNode | null`** - Function that renders the field UI
- **`children?: ReactNode`** - Usually Rule components for validation
- **`data?: AnyRecord`** - Additional data passed to `onUpdateAfterBlur` callback
- **`defaultValue?: T[K]`** - Default value for this field (overrides form-level defaults)

#### Field Render Props

The render function receives `fieldProps`:

```tsx
interface FieldRenderProps<T, K extends keyof T> {
  name: K;                              // Field name
  value: T[K] | undefined;             // Current field value
  onFocus(): void;                     // Focus handler
  onBlur(): void;                      // Blur handler  
  onChange(value: T[K] | undefined): void; // Value change handler
}
```

#### Field Render State

The render function also receives `fieldState`:

```tsx
interface FieldRenderState {
  isPristine: boolean;              // true if field hasn't been focused/modified
  validationStatus: ValidationStatus; // Current validation status and message
}
```

#### Examples

**Text input with validation:**
```tsx
<Field<UserForm, 'username'>
  name="username"
  defaultValue="admin"
  data={{ source: 'registration', priority: 'high' }}
  render={({ value, onChange, onBlur, onFocus }, { isPristine, validationStatus }) => (
    <div className="field-container">
      <label htmlFor="username">Username</label>
      <input
        id="username"
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        className={`
          input 
          ${!isPristine && validationStatus.status === 'invalid' ? 'error' : ''} 
          ${!isPristine && validationStatus.status === 'valid' ? 'valid' : ''}
        `}
        placeholder="Enter username"
      />
      
      {/* Validation feedback */}
      {!isPristine && validationStatus.status === 'invalid' && (
        <span className="error-message">
          ❌ {validationStatus.message}
        </span>
      )}
      {!isPristine && validationStatus.status === 'valid' && (
        <span className="success-message">✅ Looks good!</span>
      )}
      {validationStatus.status === 'PENDING' && (
        <span className="pending-message">⏳ Validating...</span>
      )}
    </div>
  )}
>
  <Rule validationFn={(name) => !!name} message="Username is required" />
  <Rule validationFn={(name) => !name || name.length >= 3} message="Username must be at least 3 characters" />
</Field>
```

**Select dropdown:**
```tsx
<Field<FormData, 'country'>
  name="country"
  render={({ value, onChange, onBlur, onFocus }, { validationStatus, isPristine }) => (
    <div className="field-container">
      <label>Country</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        className={!isPristine && validationStatus.status === 'invalid' ? 'error' : ''}
      >
        <option value="">Select a country</option>
        <option value="us">United States</option>
        <option value="ca">Canada</option>
        <option value="uk">United Kingdom</option>
        <option value="fr">France</option>
      </select>
      {!isPristine && validationStatus.message && (
        <span className="error-message">{validationStatus.message}</span>
      )}
    </div>
  )}
>
  <Rule validationFn={(value) => !!value} message="Please select a country" />
</Field>
```

**Checkbox field:**
```tsx
<Field<FormData, 'termsAccepted'>
  name="termsAccepted"
  render={({ value, onChange, onBlur, onFocus }, { validationStatus, isPristine }) => (
    <div className="checkbox-field">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        <span className="checkbox-text">
          I agree to the <a href="/terms">Terms and Conditions</a>
        </span>
      </label>
      {!isPristine && validationStatus.status === 'invalid' && (
        <span className="error-message">{validationStatus.message}</span>
      )}
    </div>
  )}
>
  <Rule validationFn={(accepted) => accepted === true} message="You must accept the terms and conditions" />
</Field>
```

**File upload field:**
```tsx
<Field<FormData, 'avatar'>
  name="avatar"
  render={({ value, onChange, onBlur, onFocus }, { validationStatus, isPristine }) => (
    <div className="file-field">
      <label>Profile Picture</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          onChange(file);
        }}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      
      {/* File preview */}
      {value && (
        <div className="file-preview">
          <img 
            src={URL.createObjectURL(value)} 
            alt="Avatar preview"
            style={{ maxWidth: '200px', maxHeight: '200px' }}
          />
          <button 
            type="button"
            onClick={() => onChange(undefined)}
            className="remove-file"
          >
            Remove
          </button>
        </div>
      )}
      
      {!isPristine && validationStatus.status === 'invalid' && (
        <span className="error-message">{validationStatus.message}</span>
      )}
    </div>
  )}
>
  <Rule
    validationFn={(file) => {
      if (!file) return true; // Optional field
      return file.size <= 5 * 1024 * 1024; // 5MB limit
    }}
    message="File size must be less than 5MB"
  />
  <Rule
    validationFn={(file) => {
      if (!file) return true;
      return ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
    }}
    message="File must be a JPEG, PNG, or GIF image"
  />
</Field>
```

---

### `Rule`

Registers a validation rule with the given message and validation function.

```tsx
interface RuleProps {
  validationFn: Validator;  // Function to validate field value
  message: string;          // Error message when validation fails
  isDebounced?: boolean;    // Whether to debounce validation calls
}

type Validator = (value: FieldValue) => boolean | Promise<boolean>;
```

Rules are executed in the order they appear. The first failing rule stops execution and its message is displayed.

#### Props

- **`validationFn: Validator`** - Function that returns `true` if valid, `false` if invalid. Can be synchronous or asynchronous.
- **`message: string`** - Error message displayed when validation fails
- **`isDebounced?: boolean`** - Whether to debounce validation (default: `false`). Useful for expensive async operations.

#### Examples

**Basic synchronous validation:**
```tsx
// Required field validation
const isRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

<Field name="email" render={/* ... */}>
  <Rule validationFn={isRequired} message="Email is required" />
</Field>
```

**Email validation:**
```tsx
const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Allow empty for optional fields
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

<Field name="email" render={/* ... */}>
  <Rule validationFn={isRequired} message="Email is required" />
  <Rule validationFn={isValidEmail} message="Please enter a valid email address" />
</Field>
```

**Asynchronous validation with debouncing:**
```tsx
// Check if username is available (API call)
const isUniqueUsername = async (username: string): Promise<boolean> => {
  if (!username || username.length < 3) return true; // Skip for short usernames
  
  try {
    const response = await fetch('/api/check-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error('Username validation failed:', error);
    return false; // Assume unavailable on error
  }
};

<Field name="username" render={/* ... */}>
  <Rule validationFn={isRequired} message="Username is required" />
  <Rule
    validationFn={isUniqueUsername}
    message="Username is already taken"
    isDebounced={true}  // Debounces the API call
  />
</Field>
```

**Multiple validation rules:**
```tsx
<Field<FormData, 'password'>
  name="password"
  render={/* ... */}
>
  {/* Rules are executed in order until one fails */}
  <Rule 
    validationFn={(pwd) => !!pwd} 
    message="Password is required" 
  />
  <Rule 
    validationFn={(pwd) => !pwd || pwd.length >= 8} 
    message="Password must be at least 8 characters" 
  />
  <Rule 
    validationFn={(pwd) => !pwd || /[A-Z]/.test(pwd)} 
    message="Password must contain at least one uppercase letter" 
  />
  <Rule 
    validationFn={(pwd) => !pwd || /[a-z]/.test(pwd)} 
    message="Password must contain at least one lowercase letter" 
  />
  <Rule 
    validationFn={(pwd) => !pwd || /\d/.test(pwd)} 
    message="Password must contain at least one number" 
  />
</Field>
```

**Complex validation with form context:**
```tsx
function PasswordConfirmationField() {
  const form = useFormContext<{ password: string; confirmPassword: string }>();
  const { password } = useOnChangeValues(form, ['password']);

  return (
    <Field<FormData, 'confirmPassword'>
      name="confirmPassword"
      render={/* ... */}
    >
      <Rule validationFn={(value) => !!value} message="Please confirm your password" />
      <Rule
        validationFn={(confirmPassword) => {
          if (!confirmPassword) return false;
          return confirmPassword === password; // Cross-field validation
        }}
        message="Passwords do not match"
      />
    </Field>
  );
}
```

---

## Wizard Components

### `Step`

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

#### Props

- **`children: ReactNode`** - Form fields and other content for the step
- **`name: Step`** - Step identifier that must match wizard type keys
- **`onNext?: StepValidator`** - Custom validation function called before proceeding to next step
- **`noFooter?: boolean`** - Disable the default navigation footer to implement custom navigation
- **`title?: string`** - Step title displayed in the step header

#### Examples

**Basic step with validation:**
```tsx
function PersonalInfoStep() {
  const { form } = useStepForm<RegistrationWizard, 'personal'>({
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: ''
    }
  });

  // Custom step validation
  const validatePersonalInfo = async (values: RegistrationWizard['personal']) => {
    if (!values?.firstName || !values?.lastName) {
      return false;
    }
    
    // Additional async validation if needed
    if (values.dateOfBirth) {
      const age = calculateAge(values.dateOfBirth);
      return age >= 18; // Must be 18 or older
    }
    
    return true;
  };

  return (
    <Step
      name="personal"
      title="Personal Information"
      onNext={validatePersonalInfo}
    >
      <Form form={form}>
        <Field<RegistrationWizard['personal'], 'firstName'>
          name="firstName"
          render={({ value, onChange, onBlur, onFocus }) => (
            <input
              type="text"
              placeholder="First Name"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              onFocus={onFocus}
            />
          )}
        >
          <Rule validationFn={(name) => !!name} message="First name is required" />
        </Field>

        <Field<RegistrationWizard['personal'], 'lastName'>
          name="lastName"
          render={({ value, onChange, onBlur, onFocus }) => (
            <input
              type="text"
              placeholder="Last Name"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              onFocus={onFocus}
            />
          )}
        >
          <Rule validationFn={(name) => !!name} message="Last name is required" />
        </Field>

        <Field<RegistrationWizard['personal'], 'dateOfBirth'>
          name="dateOfBirth"
          render={({ value, onChange, onBlur, onFocus }) => (
            <input
              type="date"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              onFocus={onFocus}
            />
          )}
        >
          <Rule
            validationFn={(date) => {
              if (!date) return true; // Optional field
              const age = calculateAge(date);
              return age >= 18;
            }}
            message="You must be at least 18 years old"
          />
        </Field>
      </Form>
    </Step>
  );
}
```

**Step with custom navigation:**
```tsx
function CustomNavigationStep() {
  const wizard = useWizardContext<WizardData>();
  const { form } = useStepForm<WizardData, 'custom'>();

  const handleCustomNext = async () => {
    const values = form.getFormValues();
    
    // Custom validation logic
    if (values.specialField === 'skip') {
      // Skip directly to final step
      wizard.goToStep('final');
    } else {
      // Normal progression
      await wizard.goNext();
    }
  };

  return (
    <Step name="custom" title="Custom Step" noFooter>
      <Form form={form}>
        <div className="step-content">
          <Field name="specialField" render={/* ... */} />
          {/* More fields */}
        </div>
      </Form>
      
      {/* Custom footer navigation */}
      <div className="custom-navigation">
        <button
          onClick={wizard.goPrevious}
          disabled={wizard.isFirstStep}
          className="btn btn-secondary"
        >
          ← Back
        </button>
        
        <div className="step-info">
          Step {wizard.currentStepIndex + 1} of {wizard.steps.length}
        </div>
        
        <button
          onClick={handleCustomNext}
          disabled={!wizard.isStepReady}
          className="btn btn-primary"
        >
          {wizard.isLastStep ? '✓ Complete' : 'Continue →'}
        </button>
      </div>
    </Step>
  );
}
```

---

## Context Providers

### `WizardContext`

Provides wizard context to child components via React Context.

```tsx
import { WizardContext } from 'graneet-form';

function WizardContainer() {
  const wizard = useWizard<WizardData>(
    (wizardValues) => {
      // Handle wizard completion
      console.log('Wizard completed with values:', wizardValues);
    },
    () => {
      // Handle wizard cancellation
      console.log('Wizard was cancelled');
    }
  );

  return (
    <div className="wizard-container">
      <WizardContext.Provider value={wizard}>
        <WizardHeader />
        <WizardSteps />
        <WizardFooter />
      </WizardContext.Provider>
    </div>
  );
}

function WizardSteps() {
  return (
    <div className="wizard-steps">
      <PersonalInfoStep />
      <ContactInfoStep />
      <PreferencesStep />
      <SummaryStep />
    </div>
  );
}
```

---

## Reusable Component Patterns

### Generic Field Wrapper

Create type-safe reusable field components:

```tsx
interface TextFieldProps<T extends FieldValues, K extends keyof T> {
  name: K;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

function TextField<T extends FieldValues, K extends keyof T>({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  autoComplete
}: TextFieldProps<T, K>) {
  return (
    <Field<T, K>
      name={name}
      render={({ value, onChange, onBlur, onFocus }, { validationStatus, isPristine }) => (
        <div className="text-field">
          <label htmlFor={String(name)} className="field-label">
            {label}
            {required && <span className="required-indicator">*</span>}
          </label>
          
          <input
            id={String(name)}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value as T[K])}
            onBlur={onBlur}
            onFocus={onFocus}
            className={`
              field-input
              ${!isPristine && validationStatus.status === 'invalid' ? 'error' : ''}
              ${!isPristine && validationStatus.status === 'valid' ? 'valid' : ''}
            `}
          />
          
          {/* Validation feedback */}
          {!isPristine && validationStatus.status === 'invalid' && (
            <div className="field-error">
              <Icon name="error" />
              {validationStatus.message}
            </div>
          )}
          
          {!isPristine && validationStatus.status === 'valid' && (
            <div className="field-success">
              <Icon name="check" />
              Looks good!
            </div>
          )}
        </div>
      )}
    >
      {required && (
        <Rule
          validationFn={(value) => !!value && (value as string).trim().length > 0}
          message={`${label} is required`}
        />
      )}
    </Field>
  );
}

// Usage with full type safety
<TextField<UserForm, 'email'>
  name="email"
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  autoComplete="email"
  required
/>
```

### Conditional Field Rendering

Show/hide fields based on other field values:

```tsx
function ConditionalFieldsExample() {
  const form = useFormContext<{
    accountType: 'personal' | 'business';
    companyName?: string;
    personalId?: string;
    businessId?: string;
  }>();
  
  const { accountType } = useOnChangeValues(form, ['accountType']);

  return (
    <div className="conditional-fields">
      <Field<FormData, 'accountType'>
        name="accountType"
        render={({ value, onChange, onBlur, onFocus }) => (
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="personal"
                checked={value === 'personal'}
                onChange={() => onChange('personal')}
                onBlur={onBlur}
                onFocus={onFocus}
              />
              Personal Account
            </label>
            <label>
              <input
                type="radio"
                value="business"
                checked={value === 'business'}
                onChange={() => onChange('business')}
                onBlur={onBlur}
                onFocus={onFocus}
              />
              Business Account
            </label>
          </div>
        )}
      >
        <Rule validationFn={(type) => !!type} message="Please select an account type" />
      </Field>

      {/* Conditionally render fields based on account type */}
      {accountType === 'personal' && (
        <Field<FormData, 'personalId'>
          name="personalId"
          render={({ value, onChange, onBlur, onFocus }) => (
            <input
              type="text"
              placeholder="Personal ID"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              onFocus={onFocus}
            />
          )}
        >
          <Rule validationFn={(id) => !!id} message="Personal ID is required" />
        </Field>
      )}

      {accountType === 'business' && (
        <>
          <Field<FormData, 'companyName'>
            name="companyName"
            render={({ value, onChange, onBlur, onFocus }) => (
              <input
                type="text"
                placeholder="Company Name"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                onFocus={onFocus}
              />
            )}
          >
            <Rule validationFn={(name) => !!name} message="Company name is required" />
          </Field>
          
          <Field<FormData, 'businessId'>
            name="businessId"
            render={({ value, onChange, onBlur, onFocus }) => (
              <input
                type="text"
                placeholder="Business ID"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                onFocus={onFocus}
              />
            )}
          >
            <Rule validationFn={(id) => !!id} message="Business ID is required" />
          </Field>
        </>
      )}
    </div>
  );
}
```

### Field Array Pattern

Handle dynamic arrays of fields:

```tsx
function TagsField() {
  return (
    <Field<FormData, 'tags'>
      name="tags"
      defaultValue={[]}
      render={({ value, onChange }) => {
        const tags = value || [];
        
        const addTag = (tag: string) => {
          if (tag && !tags.includes(tag)) {
            onChange([...tags, tag]);
          }
        };
        
        const removeTag = (index: number) => {
          onChange(tags.filter((_, i) => i !== index));
        };
        
        return (
          <div className="tags-field">
            <label>Tags</label>
            
            {/* Display existing tags */}
            <div className="tags-list">
              {tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button 
                    type="button"
                    onClick={() => removeTag(index)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            {/* Add new tag input */}
            <input
              type="text"
              placeholder="Add a tag..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        );
      }}
    >
      <Rule
        validationFn={(tags) => tags && tags.length > 0}
        message="At least one tag is required"
      />
    </Field>
  );
}
```