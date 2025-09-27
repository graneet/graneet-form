# Advanced Examples

## Complex Form with Dynamic Fields

This example shows a form that dynamically adds/removes fields based on user input.

```tsx
import { useForm, Form, Field, Rule, useFormContext, useFieldsWatch } from 'graneet-form';

interface ProjectForm {
  projectName: string;
  projectType: 'web' | 'mobile' | 'desktop';
  technologies: string[];
  teamSize: number;
  // Dynamic fields based on project type
  webFramework?: 'react' | 'vue' | 'angular';
  mobileFramework?: 'react-native' | 'flutter' | 'native';
  desktopFramework?: 'electron' | 'tauri' | 'qt';
}

function DynamicFields() {
  const form = useFormContext<ProjectForm>();
  const { projectType } = useFieldsWatch(form, ['projectType']);

  const renderFrameworkField = () => {
    switch (projectType) {
      case 'web':
        return (
          <Field
            name="webFramework"
            render={({ value, onChange }) => (
              <select value={value || ''} onChange={(e) => onChange(e.target.value as any)}>
                <option value="">Select Web Framework</option>
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="angular">Angular</option>
              </select>
            )}
          >
            <Rule validationFn={(value) => !!value} message="Please select a framework" />
          </Field>
        );
      case 'mobile':
        return (
          <Field
            name="mobileFramework"
            render={({ value, onChange }) => (
              <select value={value || ''} onChange={(e) => onChange(e.target.value as any)}>
                <option value="">Select Mobile Framework</option>
                <option value="react-native">React Native</option>
                <option value="flutter">Flutter</option>
                <option value="native">Native</option>
              </select>
            )}
          >
            <Rule validationFn={(value) => !!value} message="Please select a framework" />
          </Field>
        );
      case 'desktop':
        return (
          <Field
            name="desktopFramework"
            render={({ value, onChange }) => (
              <select value={value || ''} onChange={(e) => onChange(e.target.value as any)}>
                <option value="">Select Desktop Framework</option>
                <option value="electron">Electron</option>
                <option value="tauri">Tauri</option>
                <option value="qt">Qt</option>
              </select>
            )}
          >
            <Rule validationFn={(value) => !!value} message="Please select a framework" />
          </Field>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Field
        name="projectType"
        render={({ value, onChange }) => (
          <select value={value || ''} onChange={(e) => onChange(e.target.value as any)}>
            <option value="">Select Project Type</option>
            <option value="web">Web Application</option>
            <option value="mobile">Mobile Application</option>
            <option value="desktop">Desktop Application</option>
          </select>
        )}
      >
        <Rule validationFn={(value) => !!value} message="Please select a project type" />
      </Field>
      
      {projectType && renderFrameworkField()}
    </>
  );
}

function ProjectForm() {
  const form = useForm<ProjectForm>();

  return (
    <Form form={form}>
      <Field
        name="projectName"
        render={({ value, onChange }) => (
          <input
            placeholder="Project Name"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      >
        <Rule validationFn={(value) => !!value?.trim()} message="Project name is required" />
      </Field>

      <DynamicFields />

      <Field
        name="teamSize"
        render={({ value, onChange }) => (
          <input
            type="number"
            placeholder="Team Size"
            value={value || ''}
            onChange={(e) => onChange(parseInt(e.target.value) || undefined)}
          />
        )}
      >
        <Rule validationFn={(value) => value > 0} message="Team size must be greater than 0" />
      </Field>
    </Form>
  );
}
```

## Multi-Step Wizard with Conditional Steps

This example demonstrates a wizard that conditionally shows steps based on previous answers.

```tsx
import { useWizard, Step, useStepForm, WizardContext, useWizardContext } from 'graneet-form';

interface OnboardingWizard {
  userType: {
    type: 'individual' | 'business';
  };
  individual?: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
  };
  business?: {
    companyName: string;
    taxId: string;
    industry: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
}

function UserTypeStep() {
  const { form } = useStepForm<OnboardingWizard, 'userType'>();

  return (
    <Step name="userType" title="Account Type">
      <Field
        name="type"
        render={({ value, onChange }) => (
          <div>
            <label>
              <input
                type="radio"
                value="individual"
                checked={value === 'individual'}
                onChange={(e) => onChange(e.target.value as any)}
              />
              Individual Account
            </label>
            <label>
              <input
                type="radio"
                value="business"
                checked={value === 'business'}
                onChange={(e) => onChange(e.target.value as any)}
              />
              Business Account
            </label>
          </div>
        )}
      >
        <Rule validationFn={(value) => !!value} message="Please select account type" />
      </Field>
    </Step>
  );
}

function IndividualStep() {
  const { form } = useStepForm<OnboardingWizard, 'individual'>();

  return (
    <Step name="individual" title="Personal Information">
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
        <Rule validationFn={(value) => !!value?.trim()} message="First name is required" />
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
        <Rule validationFn={(value) => !!value?.trim()} message="Last name is required" />
      </Field>

      <Field
        name="dateOfBirth"
        render={({ value, onChange }) => (
          <input
            type="date"
            value={value ? value.toISOString().split('T')[0] : ''}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : undefined)}
          />
        )}
      >
        <Rule validationFn={(value) => !!value} message="Date of birth is required" />
      </Field>
    </Step>
  );
}

function BusinessStep() {
  const { form } = useStepForm<OnboardingWizard, 'business'>();

  return (
    <Step name="business" title="Business Information">
      <Field
        name="companyName"
        render={({ value, onChange }) => (
          <input
            placeholder="Company Name"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      >
        <Rule validationFn={(value) => !!value?.trim()} message="Company name is required" />
      </Field>

      <Field
        name="taxId"
        render={({ value, onChange }) => (
          <input
            placeholder="Tax ID"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      >
        <Rule validationFn={(value) => !!value?.trim()} message="Tax ID is required" />
      </Field>
    </Step>
  );
}

function ConditionalWizard() {
  const wizard = useWizard<OnboardingWizard>();
  const userTypeData = wizard.getValuesOfStep('userType');

  return (
    <WizardContext.Provider value={wizard}>
      <UserTypeStep />
      
      {userTypeData?.type === 'individual' && <IndividualStep />}
      {userTypeData?.type === 'business' && <BusinessStep />}
      
      <ContactStep />
      <PreferencesStep />
    </WizardContext.Provider>
  );
}
```

## Form with Async Validation

Example showing how to implement async validation with debouncing.

```tsx
import { useForm, Form, Field, Rule } from 'graneet-form';

interface UserRegistration {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Simulated API calls
const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  const unavailableUsernames = ['admin', 'test', 'user', 'root'];
  return !unavailableUsernames.includes(username.toLowerCase());
};

const checkEmailAvailability = async (email: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const unavailableEmails = ['test@example.com', 'admin@example.com'];
  return !unavailableEmails.includes(email.toLowerCase());
};

function AsyncValidationForm() {
  const form = useForm<UserRegistration>();

  const isValidPassword = (password: string): boolean => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  };

  const passwordsMatch = (confirmPassword: string): boolean => {
    const formValues = form.getFormValues();
    return formValues.password === confirmPassword;
  };

  return (
    <Form form={form}>
      <Field
        name="username"
        render={({ value, onChange, onBlur }, { validationStatus, isPristine }) => (
          <div>
            <input
              placeholder="Username"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
            />
            {!isPristine && validationStatus.status === 'UNDETERMINED' && (
              <span className="checking">Checking availability...</span>
            )}
          </div>
        )}
      >
        <Rule validationFn={(value) => !!value?.trim()} message="Username is required" />
        <Rule
          validationFn={checkUsernameAvailability}
          message="Username is already taken"
          isDebounced
        />
      </Field>

      <Field
        name="email"
        render={({ value, onChange, onBlur }, { validationStatus, isPristine }) => (
          <div>
            <input
              type="email"
              placeholder="Email"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
            />
            {!isPristine && validationStatus.status === 'UNDETERMINED' && (
              <span className="checking">Checking availability...</span>
            )}
          </div>
        )}
      >
        <Rule validationFn={(value) => !!value?.trim()} message="Email is required" />
        <Rule
          validationFn={checkEmailAvailability}
          message="Email is already registered"
          isDebounced
        />
      </Field>

      <Field
        name="password"
        render={({ value, onChange }) => (
          <input
            type="password"
            placeholder="Password"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      >
        <Rule validationFn={(value) => !!value} message="Password is required" />
        <Rule
          validationFn={isValidPassword}
          message="Password must be at least 8 characters with uppercase and number"
        />
      </Field>

      <Field
        name="confirmPassword"
        render={({ value, onChange }) => (
          <input
            type="password"
            placeholder="Confirm Password"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      >
        <Rule validationFn={passwordsMatch} message="Passwords do not match" />
      </Field>
    </Form>
  );
}
```

## Complex Array Management

Example showing how to work with dynamic arrays of data.

```tsx
interface TeamMember {
  name: string;
  role: string;
  email: string;
}

interface ProjectForm {
  projectName: string;
  description: string;
  teamMembers: TeamMember[];
}

function TeamMemberField({ index }: { index: number }) {
  const form = useFormContext<ProjectForm>();
  
  return (
    <div className="team-member">
      <Field
        name={`teamMembers.${index}.name` as any}
        render={({ value, onChange }) => (
          <input
            placeholder="Name"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      >
        <Rule validationFn={(value) => !!value?.trim()} message="Name is required" />
      </Field>

      <Field
        name={`teamMembers.${index}.role` as any}
        render={({ value, onChange }) => (
          <input
            placeholder="Role"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      >
        <Rule validationFn={(value) => !!value?.trim()} message="Role is required" />
      </Field>

      <Field
        name={`teamMembers.${index}.email` as any}
        render={({ value, onChange }) => (
          <input
            type="email"
            placeholder="Email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      >
        <Rule validationFn={(value) => !!value?.trim()} message="Email is required" />
      </Field>
    </div>
  );
}

function ProjectFormWithTeam() {
  const form = useForm<ProjectForm>({
    defaultValues: {
      teamMembers: [{ name: '', role: '', email: '' }]
    }
  });

  const { teamMembers } = useFieldsWatch(form, ['teamMembers']);

  const addTeamMember = () => {
    const currentValues = form.getFormValues();
    const newMembers = [...(currentValues.teamMembers || []), { name: '', role: '', email: '' }];
    form.setFormValues({ teamMembers: newMembers });
  };

  const removeTeamMember = (index: number) => {
    const currentValues = form.getFormValues();
    const newMembers = currentValues.teamMembers?.filter((_, i) => i !== index) || [];
    form.setFormValues({ teamMembers: newMembers });
  };

  return (
    <Form form={form}>
      <Field
        name="projectName"
        render={({ value, onChange }) => (
          <input
            placeholder="Project Name"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      />

      <div className="team-section">
        <h3>Team Members</h3>
        {(teamMembers || []).map((_, index) => (
          <div key={index} className="team-member-row">
            <TeamMemberField index={index} />
            <button
              type="button"
              onClick={() => removeTeamMember(index)}
              disabled={(teamMembers?.length || 0) <= 1}
            >
              Remove
            </button>
          </div>
        ))}
        
        <button type="button" onClick={addTeamMember}>
          Add Team Member
        </button>
      </div>
    </Form>
  );
}
```

## Custom Hook for Complex Logic

Create custom hooks to encapsulate complex form logic.

```tsx
import { useFormContext, useFieldsWatch, useValidations } from 'graneet-form';

// Custom hook for managing dependent fields
function useAddressDependencies() {
  const form = useFormContext<AddressForm>();
  const { country, state } = useFieldsWatch(form, ['country', 'state']);
  
  const getStatesForCountry = (country: string) => {
    const statesByCountry: Record<string, string[]> = {
      'US': ['California', 'New York', 'Texas', 'Florida'],
      'Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
      'UK': ['England', 'Scotland', 'Wales', 'Northern Ireland']
    };
    return statesByCountry[country] || [];
  };
  
  const getCitiesForState = (country: string, state: string) => {
    // Simplified city lookup
    const citiesByState: Record<string, string[]> = {
      'California': ['Los Angeles', 'San Francisco', 'San Diego'],
      'New York': ['New York City', 'Buffalo', 'Albany'],
      'Ontario': ['Toronto', 'Ottawa', 'Hamilton']
    };
    return citiesByState[state] || [];
  };

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (country) {
      const currentValues = form.getFormValues();
      const availableStates = getStatesForCountry(country);
      
      if (currentValues.state && !availableStates.includes(currentValues.state)) {
        form.setFormValues({ state: '', city: '' });
      }
    }
  }, [country]);

  useEffect(() => {
    if (state) {
      const currentValues = form.getFormValues();
      const availableCities = getCitiesForState(country, state);
      
      if (currentValues.city && !availableCities.includes(currentValues.city)) {
        form.setFormValues({ city: '' });
      }
    }
  }, [state]);

  return {
    availableStates: getStatesForCountry(country || ''),
    availableCities: getCitiesForState(country || '', state || ''),
    country,
    state
  };
}

// Custom hook for form progress tracking
function useFormProgress<T extends FieldValues>(form: FormContextApi<T>) {
  const validations = useValidations(form);
  const values = useFieldsWatch(form);

  const totalFields = Object.keys(validations).length;
  const completedFields = Object.values(validations).filter(
    v => v?.status === 'valid'
  ).length;
  const filledFields = Object.values(values).filter(v => v !== undefined && v !== '').length;

  return {
    totalFields,
    completedFields,
    filledFields,
    completionPercentage: totalFields > 0 ? (completedFields / totalFields) * 100 : 0,
    fillPercentage: totalFields > 0 ? (filledFields / totalFields) * 100 : 0
  };
}
```