# Wizard

The wizard system in graneet-form allows you to create multi-step forms with ease. Each step maintains its own form state while sharing data across the entire wizard flow.

## Core Concepts

A wizard consists of:
- **Steps**: Individual form sections with their own validation
- **Step Navigation**: Automatic progression based on validation
- **Data Persistence**: Form data is preserved across steps
- **Custom Validation**: Per-step validation logic

## Basic Usage

```tsx
import { useWizard, Step, useStepForm, Field } from 'graneet-form';

interface WizardData {
  personal: {
    firstName: string;
    lastName: string;
  };
  contact: {
    email: string;
    phone: string;
  };
}

function PersonalInfoStep() {
  const { form } = useStepForm<WizardData, 'personal'>();

  return (
    <Step name="personal" title="Personal Information">
      <Field
        name="firstName"
        render={({ value, onChange, onBlur, onFocus }) => (
          <input
            placeholder="First Name"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
          />
        )}
      />
      <Field
        name="lastName"
        render={({ value, onChange, onBlur, onFocus }) => (
          <input
            placeholder="Last Name"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
          />
        )}
      />
    </Step>
  );
}

function ContactInfoStep() {
  const { form } = useStepForm<WizardData, 'contact'>();

  return (
    <Step name="contact" title="Contact Information">
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
      />
      <Field
        name="phone"
        render={({ value, onChange, onBlur, onFocus }) => (
          <input
            placeholder="Phone"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
          />
        )}
      />
    </Step>
  );
}

function MyWizard() {
  const wizard = useWizard<WizardData>(
    (wizardValues) => {
      console.log('Wizard completed:', wizardValues);
    },
    () => {
      console.log('Wizard cancelled');
    }
  );

  return (
    <WizardContext.Provider value={wizard}>
      <PersonalInfoStep />
      <ContactInfoStep />
    </WizardContext.Provider>
  );
}
```

## Step Validation

You can add custom validation logic to control when users can proceed to the next step:

```tsx
function PersonalInfoStep() {
  const { form } = useStepForm<WizardData, 'personal'>();

  const validateStep = async (stepValues: WizardData['personal'] | undefined) => {
    if (!stepValues?.firstName || !stepValues?.lastName) {
      return false;
    }
    return true;
  };

  return (
    <Step name="personal" title="Personal Information" onNext={validateStep}>
      {/* Field components */}
    </Step>
  );
}
```

## Wizard Navigation

The wizard provides several navigation methods:

```tsx
function CustomNavigation() {
  const wizard = useWizardContext<WizardData>();

  return (
    <div>
      <button onClick={wizard.goPrevious} disabled={wizard.isFirstStep}>
        Previous
      </button>
      <button onClick={wizard.goNext} disabled={!wizard.isStepReady}>
        {wizard.isLastStep ? 'Finish' : 'Next'}
      </button>
      
      {/* Jump to specific step */}
      <button onClick={() => wizard.goBackTo('personal')}>
        Go to Personal Info
      </button>
    </div>
  );
}
```

## Accessing Step Data

You can access data from any step within the wizard:

```tsx
function SummaryStep() {
  const wizard = useWizardContext<WizardData>();
  
  const personalInfo = wizard.getValuesOfStep('personal');
  const contactInfo = wizard.getValuesOfStep('contact');
  const allData = wizard.getValuesOfSteps();

  return (
    <Step name="summary" title="Summary" noFooter>
      <h3>Personal Information</h3>
      <p>Name: {personalInfo?.firstName} {personalInfo?.lastName}</p>
      
      <h3>Contact Information</h3>
      <p>Email: {contactInfo?.email}</p>
      <p>Phone: {contactInfo?.phone}</p>
    </Step>
  );
}
```

## Advanced Features

### Custom Step Footer

You can disable the default navigation footer and create your own:

```tsx
<Step name="custom" title="Custom Step" noFooter>
  <div>
    {/* Your form fields */}
  </div>
  
  <div className="custom-footer">
    <button onClick={wizard.goPrevious}>Back</button>
    <button onClick={wizard.goNext}>Continue</button>
  </div>
</Step>
```

### Pre-configured Steps

You can initialize the wizard with predefined steps:

```tsx
const defaultSteps = [
  { name: 'personal' as const },
  { name: 'contact' as const, onNext: validateContactInfo },
  { name: 'summary' as const }
];

const wizard = useWizard<WizardData>(onFinish, onQuit, defaultSteps);
```

## Best Practices

1. **Type Safety**: Always type your wizard data structure for better TypeScript support
2. **Validation**: Use `onNext` validators for complex validation logic
3. **Data Persistence**: Leverage the automatic data persistence across steps
4. **Step Isolation**: Keep each step's logic contained within its component
5. **Custom Navigation**: Use `noFooter` when you need custom navigation controls
