# Types API Reference

Complete reference for all types, interfaces, and union types used in graneet-form, based on JSDoc documentation extracted from the source code.

## Core Foundation Types

### `FieldValue`

Base type for any field value in the form system.

```tsx
// biome-ignore lint/suspicious/noExplicitAny: Allow every type
type FieldValue = any;
```

This flexible type allows fields to contain any data type (strings, numbers, booleans, objects, arrays, etc.).

### `FieldValues`

Base type for form data structure representing all field values in a form.

```tsx
type FieldValues = Record<string, FieldValue>;
```

Forms are modeled as objects where keys are field names and values are field values.

### `AnyRecord`

Utility type for objects with string keys and unknown values.

```tsx
type AnyRecord = Record<string, unknown>;
```

Used for passing additional metadata and configuration objects throughout the form system.

### `PartialRecord<K, T>`

Utility type for creating partial records with specific keys.

```tsx
// biome-ignore lint/suspicious/noExplicitAny: Allow every key
type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
```

All properties are optional, useful for validation status mappings and partial form state.

### `Prettify<T>`

Utility type to improve TypeScript IDE display of complex intersection types.

```tsx
type Prettify<T extends Record<string, unknown>> = { [K in keyof T]: T[K] } & {};
```

Makes complex types more readable in IDE tooltips and error messages.

---

## Validation Types

### `ValidationStatus`

Union type representing the validation state of a field or form.

```tsx
type ValidationStatus = 'valid' | 'invalid' | 'undetermined';
```

**Values:**
- **`'valid'`** - Validation passed successfully
- **`'invalid'`** - Validation failed with error message
- **`'undetermined'`** - Validation hasn't been performed yet or is pending

### `ValidationState`

Object containing complete validation information for a field.

```tsx
interface ValidationState {
  status: ValidationStatus;
  message: string | undefined;
}
```

**Properties:**
- **`status`** - Current validation outcome
- **`message`** - Error message when status is `'invalid'`, `undefined` for valid/undetermined states

### `ValidationStatuses<T>`

Type mapping field names to their validation statuses for a complete form.

```tsx
type ValidationStatuses<T extends FieldValues> = Record<keyof T, ValidationState | undefined>;
```

### `Validator`

Function type for field validation rules.

```tsx
type Validator = (value: FieldValue) => boolean | Promise<boolean>;
```

**Returns:**
- `true` if the value is valid
- `false` if the value is invalid
- Can be synchronous or asynchronous (returning a Promise)

**Usage in rules:**
- Used in `<Rule validationFn={validator} message="..." />`
- Supports debouncing for expensive async operations

---

## Form Types

### `UseFormOptions<T>`

Configuration options for the `useForm` hook.

```tsx
interface UseFormOptions<T extends FieldValues> {
  /**
   * Default values for form fields.
   *
   * Can be either a static object or a function that returns the default values.
   * Using a function is useful when defaults depend on external state or need to be computed.
   */
  defaultValues?: Partial<T> | (() => Partial<T>);

  /**
   * Callback function executed when a field loses focus after being updated.
   *
   * This callback is triggered only when:
   * - The field had user focus (was actively edited)
   * - The field passes validation (status is VALID)
   * - The field loses focus (onBlur event)
   *
   * @template K - The specific field key being updated
   * @param name - The name of the field that was updated
   * @param value - The current value of the field after update
   * @param data - Additional data passed from the field's blur event
   * @param formPartial - Subset of form API methods for reading/updating form state
   * @returns Promise or void - Can be async for operations like API calls
   */
  onUpdateAfterBlur?<K extends keyof T>(
    name: K,
    value: T[K] | undefined,
    data: AnyRecord,
    formPartial: Pick<FormContextApi<T>, 'getFormValues' | 'setFormValues' | 'resetForm'>,
  ): Promise<void> | void;
}
```

**Example:**
```tsx
const form = useForm<UserForm>({
  defaultValues: () => ({
    username: localStorage.getItem('username') || '',
    theme: getSystemTheme()
  }),
  onUpdateAfterBlur: async (fieldName, value, data, { setFormValues }) => {
    if (fieldName === 'email' && value) {
      const userInfo = await fetchUserProfile(value);
      setFormValues({ name: userInfo.name });
    }
  }
});
```

### `FormContextApi<T>`

Public API interface for form instances that provides form state management and interaction methods.

```tsx
interface FormContextApi<T extends FieldValues> {
  /**
   * Internal form implementation details.
   * ⚠️ WARNING: DO NOT use outside this library.
   */
  formInternal: FormInternal<T>;

  /**
   * Retrieves all current form field values.
   */
  getFormValues(): Partial<T>;

  /**
   * Updates multiple form field values at once.
   */
  setFormValues(newValues: Partial<T>): void;

  /**
   * Resets all form fields to their default values and triggers a re-render.
   * This clears all field values and validation states.
   */
  resetForm(): void;

  /**
   * Creates a form submission handler that validates and processes form data.
   * @param submitCallback - Function to execute when form is successfully submitted
   * @returns Form event handler that can be attached to form onSubmit
   */
  handleSubmit(submitCallback: (formValues: T) => void | Promise<void>): () => void;
}
```

### `FormValues<T, Keys>`

Type representing form values for specific fields with optional values.

```tsx
type FormValues<T extends FieldValues, Keys extends keyof T> = {
  [K in Keys]: T[K] | undefined;
};
```

Used by value watching hooks to provide type-safe access to field values.

### `FormValidations<T, Keys>`

Type representing validation statuses for specific form fields.

```tsx
type FormValidations<T extends FieldValues, Keys extends keyof T> = {
  [K in Keys]: ValidationState | undefined;
};
```

Used by `useValidations` hook to provide type-safe validation status access.

### `FormStatus`

Interface describing the overall validation status of a form.

```tsx
interface FormStatus {
  /**
   * The current status of a form's validation outcome.
   */
  formStatus: ValidationStatus;

  /**
   * Indicates whether the form is considered valid or not.
   */
  isValid: boolean;
}
```

Returned by `useFormStatus` hook for form-wide validation state.

---

## Watch Mode Types

### `WatchMode`

Union type for different value watching modes in form subscriptions.

```tsx
type WatchMode = 'onChange' | 'onBlur';
```

**Values:**
- **`'onChange'`** - Values update immediately on every field change
- **`'onBlur'`** - Values update only when fields lose focus

---

## Component Props Types

### `FieldRenderProps<T, K>`

Props passed to the Field component's render function.

```tsx
interface FieldRenderProps<T extends FieldValues, K extends keyof T> {
  name: K;
  value: T[K] | undefined;
  onFocus(): void;
  onBlur(): void;
  onChange(e: T[K] | undefined): void;
}
```

**Properties:**
- **`name`** - The field name (typed to form keys)
- **`value`** - Current field value (may be undefined)
- **`onFocus`** - Handler to call when field gains focus
- **`onBlur`** - Handler to call when field loses focus
- **`onChange`** - Handler to call when field value changes

### `FieldRenderState`

State information passed to the Field component's render function.

```tsx
interface FieldRenderState {
  isPristine: boolean;
  validationStatus: ValidationState;
}
```

**Properties:**
- **`isPristine`** - `true` if the field hasn't been focused or modified yet
- **`validationStatus`** - Current validation status and error message

### `FieldProps<T, K>`

Props for the Field component.

```tsx
interface FieldProps<T extends FieldValues, K extends keyof T> {
  /**
   * The name of the field.
   */
  name: K;

  /**
   * Rules (child Rule components)
   */
  children?: ReactNode;

  /**
   * The function used to render the field component
   */
  render(fieldProps: FieldRenderProps<T, K>, fieldState: FieldRenderState): ReactNode | null;

  /**
   * Additional data passed to onUpdateAfterBlur callback
   */
  data?: AnyRecord;

  /**
   * Default value for this field (overrides form-level defaults)
   */
  defaultValue?: T[K];
}
```

### `RuleProps`

Props for the Rule component used in field validation.

```tsx
interface RuleProps {
  /**
   * Function run for the validation
   */
  validationFn: Validator;
  /**
   * Message displayed when validation fails
   */
  message: string;
  /**
   * Whether validation function runs with debouncing
   */
  isDebounced?: boolean;
}
```

### `FormProps<T>`

Props for the Form wrapper component.

```tsx
interface FormProps<T extends FieldValues> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: ReactNode;
  form: FormContextApi<T>;
  onSubmit?: () => void;
}
```

Extends all standard HTML form attributes except `onSubmit` which is handled by the form context.

### `RuleContextApi`

Internal context API for managing validation rules within fields.

```tsx
interface RuleContextApi {
  registerRule(testFn: Validator, errorMessage: string, isDebounced: boolean): void;
  unregisterRule(testFn: Validator, isDebounced: boolean): void;
}
```

Used internally by Rule components to register/unregister validation functions.

---

## Wizard Types

### `StepValidator<WizardValues, Step>`

Function type for step-level validation in wizards.

```tsx
type StepValidator<WizardValues extends Record<string, FieldValues>, Step extends keyof WizardValues> = (
  stepValues: WizardValues[Step] | undefined,
) => boolean | Promise<boolean>;
```

**Parameters:**
- **`stepValues`** - Form values for the current step
**Returns:**
- `true` to allow progression to next step
- `false` to block progression
- Can be async for server-side validation

### `Steps<WizardValues>`

Type for configuring wizard step sequence and validation.

```tsx
type Steps<WizardValues extends Record<string, FieldValues>> = {
  [K in keyof WizardValues]: {
    name: K;
    onNext?: StepValidator<WizardValues, K>;
  };
}[keyof WizardValues][];
```

Array of step configurations, each containing a step name and optional validation function.

### `WizardContextApi<WizardValues>`

API interface for wizard instances providing navigation and data access.

```tsx
interface WizardContextApi<WizardValues extends Record<string, FieldValues>> {
  /**
   * Retrieves the form values for a specific wizard step.
   */
  getValuesOfStep<Step extends keyof WizardValues>(stepName: Step): WizardValues[Step] | undefined;

  /**
   * Retrieves the form values for the currently active wizard step.
   */
  getValuesOfCurrentStep<Step extends keyof WizardValues>(): WizardValues[Step] | undefined;

  /**
   * Retrieves the form values for all wizard steps.
   */
  getValuesOfSteps(): WizardValues;

  /**
   * Internal API for wizard implementation details.
   * ⚠️ WARNING: DO NOT use outside this library.
   */
  wizardInternal: { /* ... internal methods ... */ };

  /**
   * Navigates directly to a specific previous step in the wizard.
   */
  goBackTo(previousStep: keyof WizardValues): void;

  /**
   * Advances to the next step or triggers finish callback if on last step.
   */
  goNext(): Promise<void>;

  /**
   * Navigates to the previous step or triggers quit callback if on first step.
   */
  goPrevious(): void;

  /**
   * Array of all step names in the wizard, in order.
   */
  steps: (keyof WizardValues)[];

  /**
   * The name of the currently active step.
   */
  currentStep: keyof WizardValues | undefined;

  /**
   * Whether the current step is the final step.
   */
  isLastStep: boolean;

  /**
   * Whether the current step is the first step.
   */
  isFirstStep: boolean;

  /**
   * Whether the current step has passed validation and is ready for navigation.
   */
  isStepReady: boolean;
}
```

### `StepProps<WizardValues, Step>`

Props for the Step component representing a single wizard step.

```tsx
interface StepProps<WizardValues extends Record<string, FieldValues>, Step extends keyof WizardValues> {
  children: ReactNode;
  name: Step;
  onNext?: StepValidator<WizardValues, Step>;
  noFooter?: boolean;
  title?: string;
}
```

**Properties:**
- **`children`** - Form fields and content for the step
- **`name`** - Step identifier matching wizard type keys
- **`onNext`** - Custom validation before proceeding to next step
- **`noFooter`** - Disable default navigation footer for custom navigation
- **`title`** - Step title displayed in header

### `UseStepFormApi<T>`

API returned by the `useStepForm` hook for managing form state within wizard steps.

```tsx
interface UseStepFormApi<T extends FieldValues> {
  /**
   * Form context API that can be passed to Form components.
   */
  form: FormContextApi<T>;

  /**
   * Initializes form values if no values have been previously set.
   * @deprecated Use `defaultValues` in useStepForm options instead
   */
  initFormValues(initialValues: Partial<T>): void;
}
```

---

## Utility Functions

### `mapValidationStatusesToOutcome`

Utility function to determine overall validation outcome from multiple field validation statuses.

```tsx
function mapValidationStatusesToOutcome<T extends FieldValues>(
  validationStatuses: PartialRecord<keyof T, ValidationState>,
): ValidationStatus;
```

**Logic:**
- Returns `'invalid'` if any field is invalid
- Returns `'undetermined'` if any field is undetermined and none are invalid
- Returns `'valid'` if all fields are valid

Used internally by form status calculations and step validation.

---

## Generic Constraints and Type Safety

### Type Constraints

The library uses these generic constraints to ensure type safety:

```tsx
// Form data must extend the base FieldValues type
T extends FieldValues

// Field names must be keys of the form type
K extends keyof T

// Wizard values must be a record of FieldValues for each step
WizardValues extends Record<string, FieldValues>

// Step names must be keys of the wizard values
Step extends keyof WizardValues
```

### Type-Safe Examples

**Strongly typed form with validation:**
```tsx
interface UserForm {
  email: string;
  password: string;
  age: number;
  preferences: {
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
}

const form = useForm<UserForm>({
  defaultValues: {
    preferences: { newsletter: false, theme: 'light' }
  }
});

// Type-safe field watching (only valid keys allowed)
const { email, password } = useFieldsWatch(form, ['email', 'password']);
const validations = useValidations(form, ['email']); // validations.email is ValidationState | undefined

// TypeScript ensures field names match form structure
<Field<UserForm, 'email'>  // ✅ Valid
  name="email"
  render={({ value }) => (
    <input value={value || ''} /> // value is string | undefined
  )}
/>

<Field<UserForm, 'invalid'>  // ❌ TypeScript error - 'invalid' is not a key of UserForm
  name="invalid"
  render={({ value }) => <input value={value || ''} />}
/>
```

**Strongly typed wizard:**
```tsx
interface RegistrationWizard {
  personal: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  };
  account: {
    email: string;
    username: string;
    password: string;
  };
  preferences: {
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
}

const wizard = useWizard<RegistrationWizard>(
  (allData) => {
    // allData is fully typed as RegistrationWizard
    console.log(allData.personal.firstName); // TypeScript knows this exists and is a string
    console.log(allData.account.email); // Full IntelliSense support
  }
);

// Type-safe step forms
const PersonalStep = () => {
  const { form } = useStepForm<RegistrationWizard, 'personal'>({
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: ''
    }
  });

  // form is typed specifically for RegistrationWizard['personal']
  return (
    <Step name="personal">
      <Form form={form}>
        <Field<RegistrationWizard['personal'], 'firstName'>
          name="firstName" // Must be 'firstName', 'lastName', or 'dateOfBirth'
          render={({ value, onChange }) => (
            <input 
              value={value || ''} // value is string | undefined
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        />
      </Form>
    </Step>
  );
};
```

This comprehensive type system ensures full type safety throughout the form and wizard components, providing excellent developer experience with IntelliSense and compile-time error checking.