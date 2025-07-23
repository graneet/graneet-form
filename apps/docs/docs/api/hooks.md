# Hooks API Reference

## Form Hooks

### useForm

Creates a new form instance with the specified type and options.

```tsx
function useForm<T extends FieldValues>(options?: UseFormOptions<T>): FormContextApi<T>
```

**Parameters:**
- `options.defaultValues?: Partial<T>` - Initial values for the form fields
- `options.onUpdateAfterBlur?: (values: Partial<T>, data?: AnyRecord) => void` - Callback triggered after field blur when the field is valid

**Returns:** `FormContextApi<T>` - The form context API

**Example:**
```tsx
interface FormValues {
  email: string;
  password: string;
}

const form = useForm<FormValues>({
  defaultValues: {
    email: 'user@example.com'
  },
  onUpdateAfterBlur: (values) => {
    console.log('Form updated:', values);
  }
});
```

### useFormContext

Accesses the form context within a Form component tree.

```tsx
function useFormContext<T extends FieldValues>(): FormContextApi<T>
```

**Returns:** `FormContextApi<T>` - The form context API

**Example:**
```tsx
function MyInput({ name }: { name: string }) {
  const form = useFormContext<FormValues>();
  
  return (
    <Field
      name={name}
      render={({ value, onChange }) => (
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    />
  );
}
```

### useFormStatus

Provides the overall validation status of the form.

```tsx
function useFormStatus<T extends FieldValues>(
  form: FormContextApi<T>
): { formStatus: VALIDATION_OUTCOME; isValid: boolean }
```

**Parameters:**
- `form` - The form context API

**Returns:**
- `formStatus` - Overall form validation status (VALID, INVALID, UNDETERMINED)
- `isValid` - Boolean indicating if the form is valid

**Example:**
```tsx
function SubmitButton() {
  const form = useFormContext<FormValues>();
  const { formStatus, isValid } = useFormStatus(form);

  return (
    <button type="submit" disabled={!isValid}>
      Submit ({formStatus})
    </button>
  );
}
```

### useValidations

Watches the validation status of specific fields or all fields in a form.

```tsx
function useValidations<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names?: K[]
): FormValidations<T, K extends undefined ? keyof T : K>
```

**Parameters:**
- `form` - The form context API
- `names` - Array of field names to watch. If undefined, watches all fields

**Returns:** Object mapping field names to their validation status

**Example:**
```tsx
function ValidationSummary() {
  const form = useFormContext<FormValues>();
  
  // Watch specific fields
  const validations = useValidations(form, ['email', 'password']);
  
  // Watch all fields
  const allValidations = useValidations(form);

  return (
    <div>
      {Object.entries(validations).map(([field, validation]) => (
        <div key={field}>
          {field}: {validation?.status} - {validation?.message}
        </div>
      ))}
    </div>
  );
}
```

### useOnChangeValues

Watches form field values that update on every change.

```tsx
function useOnChangeValues<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names?: K[]
): FormValues<T, K extends undefined ? keyof T : K>
```

**Parameters:**
- `form` - The form context API
- `names` - Array of field names to watch. If undefined, watches all fields

**Returns:** Object with current field values

:::warning Performance
Watching all fields (`names: undefined`) will cause re-renders on every field change. Use specific field names for better performance.
:::

**Example:**
```tsx
function LivePreview() {
  const form = useFormContext<FormValues>();
  const values = useOnChangeValues(form, ['firstName', 'lastName']);

  return (
    <div>
      Preview: {values.firstName} {values.lastName}
    </div>
  );
}
```

### useOnBlurValues

Watches form field values that update only when fields lose focus.

```tsx
function useOnBlurValues<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names?: K[]
): FormValues<T, K extends undefined ? keyof T : K>
```

**Parameters:**
- `form` - The form context API
- `names` - Array of field names to watch. If undefined, watches all fields

**Returns:** Object with current field values (updated on blur)

**Example:**
```tsx
function BlurPreview() {
  const form = useFormContext<FormValues>();
  const values = useOnBlurValues(form, ['email']);

  return (
    <div>
      Email (on blur): {values.email}
    </div>
  );
}
```

## Wizard Hooks

### useWizard

Creates a new wizard instance for multi-step forms.

```tsx
function useWizard<WizardValues extends Record<string, FieldValues>>(
  onFinish?: (wizardValues: WizardValues) => void | Promise<void>,
  onQuit?: () => void,
  defaultSteps?: Steps<WizardValues>
): WizardContextApi<WizardValues>
```

**Parameters:**
- `onFinish` - Callback called when the wizard is completed
- `onQuit` - Callback called when the wizard is cancelled
- `defaultSteps` - Pre-configured steps for the wizard

**Returns:** `WizardContextApi<WizardValues>` - The wizard context API

**Example:**
```tsx
interface WizardData {
  personal: { name: string; age: number };
  contact: { email: string; phone: string };
}

const wizard = useWizard<WizardData>(
  (data) => {
    console.log('Wizard completed:', data);
  },
  () => {
    console.log('Wizard cancelled');
  }
);
```

### useWizardContext

Accesses the wizard context within a wizard component tree.

```tsx
function useWizardContext<WizardValues extends Record<string, FieldValues>>(): WizardContextApi<WizardValues>
```

**Returns:** `WizardContextApi<WizardValues>` - The wizard context API

**Example:**
```tsx
function WizardNavigation() {
  const wizard = useWizardContext<WizardData>();

  return (
    <div>
      <button onClick={wizard.goPrevious} disabled={wizard.isFirstStep}>
        Previous
      </button>
      <button onClick={wizard.goNext} disabled={!wizard.isStepReady}>
        {wizard.isLastStep ? 'Finish' : 'Next'}
      </button>
    </div>
  );
}
```

### useStepForm

Creates a form instance for a specific wizard step.

```tsx
function useStepForm<WizardValues extends Record<string, FieldValues>, Step extends keyof WizardValues>(
  options?: UseFormOptions<WizardValues[Step]>
): {
  form: FormContextApi<WizardValues[Step]>;
  initFormValues: (values: WizardValues[Step]) => void;
}
```

**Parameters:**
- `options` - Same options as `useForm`

**Returns:**
- `form` - The form context API for the step
- `initFormValues` - Function to initialize step values

**Example:**
```tsx
function PersonalStep() {
  const { form } = useStepForm<WizardData, 'personal'>();

  return (
    <Step name="personal">
      <Field
        name="name"
        render={({ value, onChange }) => (
          <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      />
    </Step>
  );
}
```

### useStepStatus

Gets the validation status of the current step.

```tsx
function useStepStatus(): VALIDATION_OUTCOME
```

**Returns:** `VALIDATION_OUTCOME` - The current step's validation status

**Example:**
```tsx
function StepIndicator() {
  const stepStatus = useStepStatus();

  return (
    <div className={`step-indicator ${stepStatus.toLowerCase()}`}>
      Status: {stepStatus}
    </div>
  );
}
```