# Hooks API Reference

Complete reference for all hooks provided by graneet-form, based on JSDoc documentation from the source code.

## Core Form Hooks

### `useForm`

Hook for creating and managing form state with validation, field registration, and submission handling.

```tsx
function useForm<T extends FieldValues = Record<string, Record<string, unknown>>>(
  options?: UseFormOptions<T>
): FormContextApi<T>
```

This hook provides a complete form management solution including:
- Field registration and value management
- Real-time validation status tracking
- Subscription-based updates for optimal performance
- Form submission with validation
- Default values and reset functionality

#### Parameters

**`options?: UseFormOptions<T>`** - Configuration options for the form behavior

- **`defaultValues?: Partial<T> | (() => Partial<T>)`**
  
  Sets initial values for form fields. Can be either a static object or a function that returns the default values. Using a function is useful when defaults depend on external state or need to be computed.

  ```tsx
  // Static defaults
  const form = useForm({
    defaultValues: {
      name: 'John Doe',
      email: '',
      age: 25
    }
  });

  // Dynamic defaults
  const form = useForm({
    defaultValues: () => ({
      name: user?.name || '',
      email: user?.email || '',
      timestamp: Date.now()
    })
  });
  ```

- **`onUpdateAfterBlur?: <K extends keyof T>(name, value, data, formPartial) => Promise<void> | void`**
  
  Callback function executed when a field loses focus after being updated and is valid.

  **Triggers when:**
  - The field had user focus (was actively edited)
  - The field passes validation (status is VALID)  
  - The field loses focus (onBlur event)

  **Parameters:**
  - `name: K` - The name of the field that was updated
  - `value: T[K] | undefined` - The current value of the field after update
  - `data: AnyRecord` - Additional data passed from the field's blur event
  - `formPartial` - Subset of form API methods: `{ getFormValues, setFormValues, resetForm }`

  ```tsx
  const form = useForm<{ email: string; name: string }>({
    onUpdateAfterBlur: async (fieldName, value, data, { getFormValues, setFormValues }) => {
      if (fieldName === 'email' && value) {
        // Auto-populate name based on email
        const userInfo = await fetchUserByEmail(value);
        if (userInfo.name) {
          setFormValues({ name: userInfo.name });
        }
      }
    }
  });
  ```

#### Returns

**`FormContextApi<T>`** - Form context API that can be passed to Form components

The returned API includes:
- `getFormValues()` - Get all current form values
- `setFormValues(values)` - Update form field values
- `resetForm()` - Reset all fields to default state
- `handleSubmit(callback)` - Create form submission handler

#### Examples

**Basic form creation:**
```tsx
interface UserFormData {
  name: string;
  email: string;
  age: number;
}

function UserForm() {
  const form = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      age: 18
    }
  });

  return (
    <Form form={form}>
      {/* Form fields */}
    </Form>
  );
}
```

**Form with validation and submission:**
```tsx
function LoginForm() {
  const form = useForm<{ username: string; password: string }>();

  const handleSubmit = form.handleSubmit(async (formData) => {
    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setError('Invalid credentials');
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Form form={form}>
        {/* Form fields */}
        <button type="submit">Login</button>
      </Form>
    </form>
  );
}
```

---

### `useFormContext`

Hook to access the form context API within form components.

```tsx
function useFormContext<T extends FieldValues = Record<string, Record<string, unknown>>>(): FormContextApi<T>
```

This hook provides access to form state management functions and should only be used within components that are wrapped by a Form provider.

#### Returns

**`FormContextApi<T>`** - The form context API for managing form state and interactions

#### Throws

**`Error`** - If used outside of a Form context provider

#### Example

```tsx
function CustomFormField() {
  const { getFormValues, setFormValues, resetForm } = useFormContext<{
    name: string;
    email: string;
  }>();

  const handleClearForm = () => {
    setFormValues({ name: '', email: '' });
  };

  const handleReset = () => {
    resetForm();
  };

  const currentValues = getFormValues();

  return (
    <div>
      <button onClick={handleClearForm}>Clear Form</button>
      <button onClick={handleReset}>Reset Form</button>
      <pre>{JSON.stringify(currentValues, null, 2)}</pre>
    </div>
  );
}
```

---

### `useFormStatus`

Retrieves the status of a form and its validation outcomes.

```tsx
function useFormStatus<T extends FieldValues>(form: FormContextApi<T>): FormStatus
```

#### Parameters

**`form: FormContextApi<T>`** - The form context API instance

#### Returns

**`FormStatus`** - Object containing form status information:

```tsx
interface FormStatus {
  formStatus: VALIDATION_OUTCOME; // Current status of form validation
  isValid: boolean;               // Whether the form is considered valid
}
```

**Form status values:**
- `VALID` - All fields are valid
- `INVALID` - At least one field is invalid
- `UNDETERMINED` - Some fields haven't been validated yet

#### Example

```tsx
function SubmitButton() {
  const form = useFormContext<FormData>();
  const { formStatus, isValid } = useFormStatus(form);

  return (
    <div className="submit-section">
      <div className="form-status">
        Status: <span className={formStatus.toLowerCase()}>{formStatus}</span>
      </div>
      
      <button 
        type="submit" 
        disabled={!isValid}
        className={`submit-btn ${isValid ? 'enabled' : 'disabled'}`}
      >
        {formStatus === 'PENDING' ? 'Validating...' : 'Submit Form'}
      </button>
    </div>
  );
}
```

---

## Value Watching Hooks

### `useOnChangeValues`

Watch form values that update immediately on every change (real-time updates).

```tsx
// Watch all fields
function useOnChangeValues<T extends FieldValues = Record<string, unknown>>(
  form: FormContextApi<T>,
  names: undefined
): Partial<T>

// Watch specific fields
function useOnChangeValues<T extends FieldValues = Record<string, unknown>, K extends keyof T = keyof T>(
  form: FormContextApi<T>,
  names: K[]
): Prettify<FormValues<T, K>>
```

#### Parameters

- **`form: FormContextApi<T>`** - The form context API
- **`names: K[] | undefined`** - Array of field names to watch. If undefined, watches all fields

#### Returns

**`Partial<T>` | `FormValues<T, K>`** - Object with current field values

#### Performance Warning

:::warning Performance Impact
Watching all fields (`names: undefined`) causes components to re-render on every field change. Use specific field names for better performance.
:::

#### Examples

**Watch specific fields (recommended):**
```tsx
function LiveFormDisplay() {
  const form = useFormContext<{ name: string; email: string }>();
  
  // Only re-renders when name or email changes
  const { name, email } = useOnChangeValues(form, ['name', 'email']);
  
  return (
    <div>
      <p>Name: {name}</p>
      <p>Email: {email}</p>
    </div>
  );
}
```

**Watch all fields (use sparingly):**
```tsx
function FormDebugger() {
  const form = useFormContext<FormData>();
  const allValues = useOnChangeValues(form, undefined);
  
  return (
    <pre>{JSON.stringify(allValues, null, 2)}</pre>
  );
}
```

**Real-time search:**
```tsx
function SearchableForm() {
  const form = useFormContext<{ searchQuery: string }>();
  const { searchQuery } = useOnChangeValues(form, ['searchQuery']);
  
  // Updates immediately as user types
  const searchResults = useMemo(() => 
    performSearch(searchQuery), [searchQuery]
  );
  
  return (
    <div>
      <Field name="searchQuery" render={/* search input */} />
      <SearchResults results={searchResults} />
    </div>
  );
}
```

---

### `useOnBlurValues`

Watch form values that update only when fields lose focus.

```tsx
// Watch all fields
function useOnBlurValues<T extends FieldValues = Record<string, unknown>>(
  form: FormContextApi<T>,
  names: undefined
): Partial<T>

// Watch specific fields
function useOnBlurValues<T extends FieldValues = Record<string, unknown>, K extends keyof T = keyof T>(
  form: FormContextApi<T>,
  names: K[]
): Prettify<FormValues<T, K>>
```

#### Parameters

- **`form: FormContextApi<T>`** - The form context API
- **`names: K[] | undefined`** - Array of field names to watch. If undefined, watches all fields

#### Returns

**`Partial<T>` | `FormValues<T, K>`** - Object with current field values (updated on blur)

#### Use Cases

Perfect for:
- Form summaries and previews
- Auto-save functionality
- Validation displays
- Less critical updates that don't need real-time feedback

#### Examples

**Form summary (updates on field blur):**
```tsx
function FormSummary() {
  const form = useFormContext<UserForm>();
  const { title, description } = useOnBlurValues(form, ['title', 'description']);
  
  return (
    <div className="summary">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

**Auto-save on blur:**
```tsx
function AutoSaveForm() {
  const form = useFormContext<DocumentForm>();
  const [saveStatus, setSaveStatus] = useState('saved');
  
  // Only triggers save when user finishes editing fields
  const { content, title } = useOnBlurValues(form, ['content', 'title']);
  
  useEffect(() => {
    setSaveStatus('saving');
    const saveTimeout = setTimeout(async () => {
      await saveDraft({ content, title });
      setSaveStatus('saved');
    }, 500);
    
    return () => clearTimeout(saveTimeout);
  }, [content, title]);
  
  return <div>Status: {saveStatus}</div>;
}
```

---

## Validation Hooks

### `useValidations`

Watch validation status of specific fields or all fields in a form.

```tsx
// Watch all field validations
function useValidations<T extends FieldValues>(
  form: FormContextApi<T>,
  names: undefined
): PartialRecord<keyof T, ValidationStatus | undefined>

// Watch specific field validations  
function useValidations<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names: K[]
): FormValidations<T, K>
```

#### Parameters

- **`form: FormContextApi<T>`** - The form context API
- **`names: K[] | undefined`** - Array of field names to watch for validation changes. If undefined, watches all fields

#### Returns

**`PartialRecord<keyof T, ValidationStatus | undefined>` | `FormValidations<T, K>`** - Object mapping field names to their validation status

#### Validation Status

Each field's validation status contains:
```tsx
interface ValidationStatus {
  status: 'VALID' | 'INVALID' | 'PENDING';
  message?: string; // Error message if status is INVALID
}
```

#### Examples

**Validation summary for specific fields:**
```tsx
function ValidationSummary() {
  const form = useFormContext<FormData>();
  
  // Watch specific field validations
  const { email, password } = useValidations(form, ['email', 'password']);
  
  const hasErrors = [email, password].some(
    validation => validation?.status === 'INVALID'
  );
  
  return (
    <div className="validation-summary">
      {hasErrors && <p>Please fix the errors above</p>}
      
      <div className="field-status">
        <div className={`status ${email?.status?.toLowerCase()}`}>
          Email: {email?.status}
          {email?.message && <span> - {email.message}</span>}
        </div>
        <div className={`status ${password?.status?.toLowerCase()}`}>
          Password: {password?.status}
          {password?.message && <span> - {password.message}</span>}
        </div>
      </div>
    </div>
  );
}
```

**Global validation overview:**
```tsx
function GlobalValidationStatus() {
  const form = useFormContext<FormData>();
  const allValidations = useValidations(form, undefined);
  
  const errorFields = Object.entries(allValidations)
    .filter(([_, validation]) => validation?.status === 'INVALID')
    .map(([fieldName, validation]) => ({
      field: fieldName,
      message: validation?.message
    }));
  
  if (errorFields.length === 0) {
    return <div className="success">✅ All fields are valid</div>;
  }
  
  return (
    <div className="errors">
      <h4>Please fix the following errors:</h4>
      <ul>
        {errorFields.map(({ field, message }) => (
          <li key={field}>
            <strong>{field}:</strong> {message}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Wizard Hooks

### `useWizard`

Creates a new wizard instance for multi-step forms.

```tsx
function useWizard<WizardValues extends Record<string, FieldValues>>(
  onFinish?: (wizardValues: WizardValues) => void | Promise<void>,
  onQuit?: () => void,
  defaultSteps?: Steps<WizardValues>
): WizardContextApi<WizardValues>
```

#### Parameters

- **`onFinish?: (wizardValues: WizardValues) => void | Promise<void>`** - Callback called when the wizard is completed with all collected data
- **`onQuit?: () => void`** - Callback called when the wizard is cancelled/quit
- **`defaultSteps?: Steps<WizardValues>`** - Pre-configured steps for the wizard

#### Returns

**`WizardContextApi<WizardValues>`** - The wizard context API with navigation and data access methods

#### Example

```tsx
interface RegistrationWizard {
  personal: { name: string; age: number; email: string };
  account: { username: string; password: string };
  preferences: { newsletter: boolean; theme: 'light' | 'dark' };
}

function RegistrationWizardContainer() {
  const wizard = useWizard<RegistrationWizard>(
    async (wizardData) => {
      // Called when wizard completes
      console.log('Registration data:', wizardData);
      await submitRegistration(wizardData);
      navigate('/welcome');
    },
    () => {
      // Called when wizard is cancelled
      console.log('Registration cancelled');
      navigate('/');
    }
  );

  return (
    <WizardContext.Provider value={wizard}>
      <PersonalInfoStep />
      <AccountStep />
      <PreferencesStep />
    </WizardContext.Provider>
  );
}
```

---

### `useWizardContext`

Accesses the wizard context within a wizard component tree.

```tsx
function useWizardContext<WizardValues extends Record<string, FieldValues>>(): WizardContextApi<WizardValues>
```

#### Returns

**`WizardContextApi<WizardValues>`** - The wizard context API

#### Example

```tsx
function WizardNavigation() {
  const wizard = useWizardContext<RegistrationWizard>();

  return (
    <div className="wizard-navigation">
      <button 
        onClick={wizard.goPrevious} 
        disabled={wizard.isFirstStep}
        className="btn-secondary"
      >
        ← Previous
      </button>
      
      <div className="step-indicator">
        Step {wizard.currentStepIndex + 1} of {wizard.steps.length}
      </div>
      
      <button 
        onClick={wizard.goNext} 
        disabled={!wizard.isStepReady}
        className="btn-primary"
      >
        {wizard.isLastStep ? '✓ Complete' : 'Next →'}
      </button>
    </div>
  );
}
```

---

### `useStepForm`

Creates a form instance for a specific wizard step.

```tsx
function useStepForm<WizardValues extends Record<string, FieldValues>, Step extends keyof WizardValues>(
  options?: UseFormOptions<WizardValues[Step]>
): {
  form: FormContextApi<WizardValues[Step]>;
  initFormValues: (values: WizardValues[Step]) => void;
}
```

#### Parameters

- **`options?: UseFormOptions<WizardValues[Step]>`** - Same options as `useForm` but scoped to the step's data type

#### Returns

- **`form: FormContextApi<WizardValues[Step]>`** - The form context API for the specific step
- **`initFormValues: (values: WizardValues[Step]) => void`** - Function to initialize step values (useful for loading saved progress)

#### Example

```tsx
function PersonalInfoStep() {
  const { form, initFormValues } = useStepForm<RegistrationWizard, 'personal'>({
    defaultValues: {
      name: '',
      age: 18,
      email: ''
    },
    onUpdateAfterBlur: async (fieldName, value) => {
      // Auto-save step progress
      if (fieldName === 'email' && value) {
        await saveStepProgress('personal', { email: value });
      }
    }
  });

  // Load saved progress on mount
  useEffect(() => {
    loadStepProgress('personal').then(savedData => {
      if (savedData) {
        initFormValues(savedData);
      }
    });
  }, [initFormValues]);

  return (
    <Step name="personal" title="Personal Information">
      <Form form={form}>
        <Field<RegistrationWizard['personal'], 'name'>
          name="name"
          render={({ value, onChange, onBlur, onFocus }) => (
            <input
              type="text"
              placeholder="Full Name"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              onFocus={onFocus}
            />
          )}
        >
          <Rule validationFn={(name) => !!name} message="Name is required" />
        </Field>

        <Field<RegistrationWizard['personal'], 'email'>
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
      </Form>
    </Step>
  );
}
```

---

### `useStepStatus`

Gets the validation status of the current wizard step.

```tsx
function useStepStatus(): VALIDATION_OUTCOME
```

#### Returns

**`VALIDATION_OUTCOME`** - The current step's validation status:
- `VALID` - Step is valid and ready to proceed
- `INVALID` - Step has validation errors
- `UNDETERMINED` - Step validation is pending or not yet performed

#### Example

```tsx
function StepStatusIndicator() {
  const stepStatus = useStepStatus();
  
  const getStatusIcon = (status: VALIDATION_OUTCOME) => {
    switch (status) {
      case 'VALID': return '✅';
      case 'INVALID': return '❌';
      case 'UNDETERMINED': return '⏳';
    }
  };
  
  const getStatusMessage = (status: VALIDATION_OUTCOME) => {
    switch (status) {
      case 'VALID': return 'Step completed successfully';
      case 'INVALID': return 'Please fix the errors in this step';
      case 'UNDETERMINED': return 'Complete this step to continue';
    }
  };

  return (
    <div className={`step-status ${stepStatus.toLowerCase()}`}>
      <span className="status-icon">{getStatusIcon(stepStatus)}</span>
      <span className="status-message">{getStatusMessage(stepStatus)}</span>
    </div>
  );
}
```

---

## Hook Usage Patterns

### Performance Optimization

```tsx
// ✅ Watch only needed fields
function OptimizedComponent() {
  const form = useFormContext<FormData>();
  
  // Critical fields that need immediate updates
  const { searchQuery } = useOnChangeValues(form, ['searchQuery']);
  
  // Less critical fields that can update on blur
  const { title, description } = useOnBlurValues(form, ['title', 'description']);
  
  return (
    <div>
      <SearchResults query={searchQuery} />
      <FormPreview title={title} description={description} />
    </div>
  );
}

// ❌ Avoid watching all fields unless necessary
function IneffientComponent() {
  const form = useFormContext<FormData>();
  const allValues = useOnChangeValues(form, undefined); // Re-renders on every change
  
  return <div>{allValues.searchQuery}</div>; // Only needs searchQuery
}
```

### Custom Form Hooks

```tsx
// Create reusable form logic
function useFormProgress<T extends FieldValues>(
  form: FormContextApi<T>, 
  requiredFields: (keyof T)[]
) {
  const values = useOnBlurValues(form, requiredFields);
  
  return useMemo(() => {
    const completedFields = requiredFields.filter(
      field => values[field] != null && values[field] !== ''
    ).length;
    
    return {
      completed: completedFields,
      total: requiredFields.length,
      percentage: (completedFields / requiredFields.length) * 100,
      isComplete: completedFields === requiredFields.length
    };
  }, [values, requiredFields]);
}

// Usage
function FormProgressIndicator() {
  const form = useFormContext<UserForm>();
  const progress = useFormProgress(form, ['name', 'email', 'password']);
  
  return (
    <div className="progress-bar">
      <div 
        className="progress-fill" 
        style={{ width: `${progress.percentage}%` }}
      />
      <span>{progress.completed}/{progress.total} fields completed</span>
    </div>
  );
}
```