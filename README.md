<div align="center">

# graneet-form

<img src="apps/docs/public/graneet-form-logo.png" alt="Graneet Form Logo" width="200">

### A performant, type-safe forms and wizard library for React

[![NPM Version](https://img.shields.io/npm/v/graneet-form?style=flat-square&color=blue)](https://www.npmjs.com/package/graneet-form)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/graneet-form?style=flat-square&color=green)](https://bundlephobia.com/package/graneet-form)
[![License](https://img.shields.io/npm/l/graneet-form?style=flat-square&color=orange)](https://github.com/graneet/graneet-form/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)

**[📚 Documentation](https://graneet-form.vercel.app/)** • **[🚀 Quick Start](#usage)** • **[💡 Examples](#wizard-example)
**

</div>

---

## Table of Contents

- [Features](#features-)
- [Installation](#installation)
- [Usage](#usage)
- [Wizard Example](#wizard-example)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Features 🚀

- **Performant and easy to use** - Built for optimal performance with minimal re-renders
- **Integrated wizard system** - Seamlessly combine multi-step forms with powerful form management
- **Small bundle size** - Lightweight library that won't bloat your application
- **Built-in error handling** - Comprehensive validation and error management
- **Value watching** - Real-time form state monitoring and reactive updates
- **TypeScript support** - Full type safety out of the box

## Installation

```bash
# Using pnpm (recommended)
pnpm add graneet-form

# Using yarn
yarn add graneet-form

# Using npm
npm install graneet-form
```

## Usage

### Quick Start

```tsx
import {Field, Form, useForm} from 'graneet-form';

function Input({name}: { name: string }) {
    return (
        <Field
            name={name}
            render={({value, onChange, onBlur, onFocus}, state) => (
                <div>
                    <input
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        placeholder={`Enter ${name}`}
                        style={{
                            borderColor: state.error ? '#ff6b6b' : '#e0e0e0',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid'
                        }}
                    />
                    {state.error && (
                        <span style={{color: '#ff6b6b', fontSize: '12px'}}>
              {state.error}
            </span>
                    )}
                </div>
            )}
        />
    );
}

function App() {
    const form = useForm({
        validations: {
            firstName: (value) => !value ? 'First name is required' : undefined,
            lastName: (value) => !value ? 'Last name is required' : undefined
        }
    });

    const handleSubmit = async () => {
        const isValid = await form.validate();
        if (isValid) {
            const values = form.getFormValues();
            console.log('✅ Form submitted:', values);
        } else {
            console.log('❌ Form has errors');
        }
    };

    return (
        <Form form={form}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <Input name="firstName"/>
                <Input name="lastName"/>
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Submit Form
                </button>
            </div>
        </Form>
    );
}
```

## Wizard Example

Create multi-step forms with ease:

```tsx
import {Step, Wizard, useWizard} from 'graneet-form';

function MultiStepForm() {
    const wizard = useWizard({
        validations: {
            personal: {
                firstName: (value) => !value ? 'Required' : undefined,
                lastName: (value) => !value ? 'Required' : undefined
            },
            contact: {
                email: (value) => {
                    if (!value) return 'Email is required';
                    if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email';
                    return undefined;
                }
            }
        }
    });

    const {currentStep, isFirstStep, isLastStep, nextStep, previousStep} = wizard;

    return (
        <Wizard wizard={wizard}>
            <Step name="personal" title="Personal Information">
                <h2>Step 1: Personal Details</h2>
                <Input name="firstName"/>
                <Input name="lastName"/>
            </Step>

            <Step name="contact" title="Contact Information">
                <h2>Step 2: Contact Details</h2>
                <Input name="email"/>
                <Input name="phone"/>
            </Step>

            <Step name="review" title="Review">
                <h2>Step 3: Review & Submit</h2>
                <pre>{JSON.stringify(wizard.getAllValues(), null, 2)}</pre>
            </Step>

            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                {!isFirstStep && (
                    <button onClick={previousStep}>Previous</button>
                )}
                {!isLastStep ? (
                    <button onClick={nextStep}>Next</button>
                ) : (
                    <button onClick={() => console.log('Submit!', wizard.getAllValues())}>
                        Submit
                    </button>
                )}
            </div>
        </Wizard>
    );
}
```

## API Reference

### 🪝 Core Hooks

| Hook                       | Description                           | Returns                               |
|----------------------------|---------------------------------------|---------------------------------------|
| `useForm(options?)`        | Initialize a new form instance        | Form object with methods and state    |
| `useWizard(options?)`      | Initialize a new wizard instance      | Wizard object with navigation methods |
| `useFormStatus()`          | Get current form validation status    | `{ isValid, errors, isDirty }`        |
| `useFieldValidation(name)` | Handle field-level validation         | Field validation state                |
| `useFormValues()`          | Access current form values reactively | Current form values object            |

### 🧩 Components

| Component  | Props                              | Description                           |
|------------|------------------------------------|---------------------------------------|
| `<Form>`   | `form: FormInstance`               | Form provider component               |
| `<Field>`  | `name: string, render: RenderProp` | Render prop component for form fields |
| `<Wizard>` | `wizard: WizardInstance`           | Wizard provider component             |
| `<Step>`   | `name: string, title?: string`     | Individual step in a wizard           |

## Contributing

We welcome contributions! Here's how you can help:

1. 🐛 **Report bugs** - Open an issue with a detailed description
2. 💡 **Suggest features** - Share your ideas for improvements
3. 🔧 **Submit PRs** - Fix bugs or implement new features
4. 📝 **Improve docs** - Help make our documentation better

## License

MIT © [Graneet](https://graneet.com)
