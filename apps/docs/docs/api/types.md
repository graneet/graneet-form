# Types API Reference

## Core Types

### FieldValue

Base type for any field value.

```tsx
type FieldValue = any;
```

### FieldValues

Base type for form data structure.

```tsx
type FieldValues = Record<string, FieldValue>;
```

### AnyRecord

Utility type for objects with string keys and unknown values.

```tsx
type AnyRecord = Record<string, unknown>;
```

### PartialRecord

Utility type for partial records.

```tsx
type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
```

### Prettify

Utility type to improve TypeScript IDE display of complex types.

```tsx
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
```

## Validation Types

### VALIDATION_OUTCOME

Enum representing the validation state of a field or form.

```tsx
enum VALIDATION_OUTCOME {
  VALID = 'VALID',
  INVALID = 'INVALID', 
  UNDETERMINED = 'UNDETERMINED'
}
```

- **VALID**: Validation passed
- **INVALID**: Validation failed
- **UNDETERMINED**: Validation hasn't been performed or is pending

### ValidationStatus

Object containing validation information for a field.

```tsx
interface ValidationStatus {
  status: VALIDATION_OUTCOME;
  message: string | undefined;
}
```

- `status`: Current validation outcome
- `message`: Error message when status is INVALID, undefined otherwise

### Validator

Function type for validation rules.

```tsx
type Validator = (value: FieldValue) => boolean | Promise<boolean>;
```

Returns `true` if valid, `false` if invalid. Can be synchronous or asynchronous.

## Form Types

### UseFormOptions

Options for configuring a form instance.

```tsx
interface UseFormOptions<T extends FieldValues> {
  defaultValues?: Partial<T>;
  onUpdateAfterBlur?: (values: Partial<T>, data?: AnyRecord) => void;
}
```

- `defaultValues`: Initial field values
- `onUpdateAfterBlur`: Callback triggered after field blur when field is valid

### FormContextApi

API interface for form instances.

```tsx
interface FormContextApi<T extends FieldValues> {
  // Value management
  getFormValues(): Partial<T>;
  setFormValues(newValues: Partial<T>): void;
  resetForm(): void;
  
  // Form submission
  handleSubmit(callback: (values: Partial<T>) => void): () => void;
  
  // Internal methods (used by components)
  // ... (implementation details)
}
```

### FormValues

Type representing form values with optional fields.

```tsx
type FormValues<T extends FieldValues, Keys extends keyof T> = {
  [K in Keys]: T[K] | undefined;
};
```

### FormValidations

Type representing validation statuses for form fields.

```tsx
type FormValidations<T extends FieldValues, Keys extends keyof T> = {
  [K in Keys]: ValidationStatus | undefined;
};
```

## Watch Types

### WATCH_MODE

Enum for different value watching modes.

```tsx
enum WATCH_MODE {
  ON_CHANGE = 'ON_CHANGE',
  ON_BLUR = 'ON_BLUR'
}
```

- **ON_CHANGE**: Values update on every change
- **ON_BLUR**: Values update only when field loses focus

## Wizard Types

### StepValidator

Function type for step-level validation in wizards.

```tsx
type StepValidator<WizardValues extends Record<string, FieldValues>, Step extends keyof WizardValues> = (
  stepValues: WizardValues[Step] | undefined
) => boolean | Promise<boolean>;
```

Returns `true` to allow progression to next step, `false` to block.

### Steps

Type for configuring wizard steps.

```tsx
type Steps<WizardValues extends Record<string, FieldValues>> = {
  [K in keyof WizardValues]: {
    name: K;
    onNext?: StepValidator<WizardValues, K>;
  };
}[keyof WizardValues][];
```

Array of step configurations with optional validation.

### WizardContextApi

API interface for wizard instances.

```tsx
interface WizardContextApi<WizardValues extends Record<string, FieldValues>> {
  // Step information
  steps: (keyof WizardValues)[];
  currentStep: keyof WizardValues | undefined;
  isLastStep: boolean;
  isFirstStep: boolean;
  hasNoFooter: boolean;
  isStepReady: boolean;

  // Navigation
  goNext(): Promise<void>;
  goPrevious(): void;
  goBackTo(step: keyof WizardValues): void;

  // Data access
  getValuesOfStep<Step extends keyof WizardValues>(stepName: Step): WizardValues[Step] | undefined;
  getValuesOfCurrentStep<Step extends keyof WizardValues>(): WizardValues[Step] | undefined;
  getValuesOfSteps(): WizardValues;
  
  // Internal methods
  // ... (implementation details)
}
```

## Component Prop Types

### FieldRenderProps

Props passed to Field render function.

```tsx
interface FieldRenderProps<T extends FieldValues, K extends keyof T> {
  name: K;
  value: T[K] | undefined;
  onFocus(): void;
  onBlur(): void;
  onChange(value: T[K] | undefined): void;
}
```

### FieldRenderState

State information passed to Field render function.

```tsx
interface FieldRenderState {
  isPristine: boolean;
  validationStatus: ValidationStatus;
}
```

- `isPristine`: Whether the field has been interacted with
- `validationStatus`: Current validation status and message

### FieldProps

Props for the Field component.

```tsx
interface FieldProps<T extends FieldValues, K extends keyof T> {
  name: K;
  children?: ReactNode; // Rules
  render(fieldProps: FieldRenderProps<T, K>, fieldState: FieldRenderState): ReactNode | null;
  data?: AnyRecord;
  defaultValue?: T[K];
}
```

### FormProps

Props for the Form component.

```tsx
interface FormProps<T extends FieldValues> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: ReactNode;
  form: FormContextApi<T>;
  onSubmit?: () => void;
}
```

### RuleProps

Props for the Rule component.

```tsx
interface RuleProps {
  validationFn: Validator;
  message: string;
  isDebounced?: boolean;
}
```

### StepProps

Props for the Step component.

```tsx
interface StepProps<WizardValues extends Record<string, FieldValues>, Step extends keyof WizardValues> {
  children: ReactNode;
  name: Step;
  onNext?: StepValidator<WizardValues, Step>;
  noFooter?: boolean;
  title?: string;
}
```

## Utility Functions

### mapValidationStatusesToOutcome

Utility function to determine overall outcome from multiple validation statuses.

```tsx
function mapValidationStatusesToOutcome(statuses: ValidationStatus[]): VALIDATION_OUTCOME;
```

Takes an array of validation statuses and returns:
- `VALID` if all are valid
- `INVALID` if any are invalid  
- `UNDETERMINED` if any are undetermined and none are invalid

## Generic Constraints

Most types use these constraints to ensure type safety:

```tsx
// Form types must extend FieldValues
T extends FieldValues

// Field names must be keys of the form type
K extends keyof T

// Wizard values must be a record of FieldValues
WizardValues extends Record<string, FieldValues>

// Step names must be keys of WizardValues
Step extends keyof WizardValues
```

## Example Type Usage

### Strongly Typed Form

```tsx
interface UserForm {
  email: string;
  password: string;
  age: number;
  isAdmin: boolean;
}

const form = useForm<UserForm>({
  defaultValues: {
    isAdmin: false
  }
});

// Type-safe field access
const validations = useValidations(form, ['email', 'password']); // Only allows valid keys
const values = useOnChangeValues(form, ['email']); // values.email is string | undefined
```

### Strongly Typed Wizard

```tsx
interface RegistrationWizard {
  personal: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
  };
  account: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  preferences: {
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
}

const wizard = useWizard<RegistrationWizard>(
  (data) => {
    // data is fully typed as RegistrationWizard
    console.log(data.personal.firstName); // TypeScript knows this exists
  }
);

// Type-safe step form
const { form } = useStepForm<RegistrationWizard, 'personal'>();
// form is typed for RegistrationWizard['personal'] only
```