# Troubleshooting

## Common Issues and Solutions

### Form Values Not Updating

**Problem**: Field values are not updating when changed.

**Possible Causes and Solutions**:

1. **Missing onChange handler**:
   ```tsx
   // ❌ Wrong - missing onChange
   <Field
     name="email"
     render={({ value }) => (
       <input value={value || ''} />
     )}
   />

   // ✅ Correct - include onChange
   <Field
     name="email"
     render={({ value, onChange }) => (
       <input 
         value={value || ''} 
         onChange={(e) => onChange(e.target.value)} 
       />
     )}
   />
   ```

2. **Incorrect event handling**:
   ```tsx
   // ❌ Wrong - passing event object
   onChange={(e) => onChange(e)}

   // ✅ Correct - extracting value
   onChange={(e) => onChange(e.target.value)}
   ```

### Validation Not Triggering

**Problem**: Rules are not being validated.

**Possible Causes and Solutions**:

1. **Missing onBlur handler**:
   ```tsx
   // ❌ Wrong - validation triggers on blur
   <Field
     name="email"
     render={({ value, onChange }) => (
       <input value={value || ''} onChange={(e) => onChange(e.target.value)} />
     )}
   >
     <Rule validationFn={isRequired} message="Required" />
   </Field>

   // ✅ Correct - include onBlur
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

2. **Incorrect validation function**:
   ```tsx
   // ❌ Wrong - validation function has errors
   const isRequired = (value) => {
     return value !== undefined; // This allows empty strings
   };

   // ✅ Correct - proper validation
   const isRequired = (value) => {
     return value != null && value !== '';
   };
   ```

### TypeScript Errors

**Problem**: TypeScript compilation errors with form types.

**Common Solutions**:

1. **Properly type your form interface**:
   ```tsx
   // ❌ Wrong - using any
   const form = useForm<any>();

   // ✅ Correct - specific interface
   interface MyForm {
     email: string;
     age: number;
   }
   const form = useForm<MyForm>();
   ```

2. **Field name type safety**:
   ```tsx
   // ❌ Wrong - hardcoded strings
   const values = useFieldsWatch(form, ['nonexistentField']);

   // ✅ Correct - only valid field names
   const values = useFieldsWatch(form, ['email', 'age']);
   ```

### Wizard Navigation Issues

**Problem**: Wizard steps not navigating correctly.

**Possible Causes and Solutions**:

1. **Missing step registration**:
   ```tsx
   // ❌ Wrong - step not wrapped in Step component
   function MyStep() {
     const { form } = useStepForm<WizardData, 'personal'>();
     
     return (
       <div>
         <Field name="firstName" render={...} />
       </div>
     );
   }

   // ✅ Correct - wrapped in Step
   function MyStep() {
     const { form } = useStepForm<WizardData, 'personal'>();
     
     return (
       <Step name="personal">
         <Field name="firstName" render={...} />
       </Step>
     );
   }
   ```

2. **Step validation blocking navigation**:
   ```tsx
   // Check step validation logic
   const validateStep = async (values) => {
     console.log('Step validation:', values); // Debug output
     return values?.requiredField != null;
   };

   <Step name="personal" onNext={validateStep}>
     {/* Fields */}
   </Step>
   ```

### Performance Issues

**Problem**: Form re-renders too frequently.

**Solutions**:

1. **Use specific field watching**:
   ```tsx
   // ❌ Slow - watches all fields
   const values = useFieldsWatch(form);

   // ✅ Fast - watches only needed fields
   const values = useFieldsWatch(form, ['email', 'name']);
   ```

2. **Use onBlur for non-critical updates**:
   ```tsx
   // For display purposes, use onBlur
   const values = useFieldsWatch(form, ['firstName', 'lastName'], { mode: 'onBlur' });
   ```

3. **Debounce expensive operations**:
   ```tsx
   <Rule
     validationFn={expensiveAsyncValidation}
     message="Checking availability..."
     isDebounced // This prevents rapid API calls
   />
   ```

### Memory Leaks

**Problem**: Form contexts not cleaning up properly.

**Solutions**:

1. **Proper component unmounting**:
   ```tsx
   // Ensure forms are properly disposed when components unmount
   useEffect(() => {
     return () => {
       // Form cleanup happens automatically
       // But you can add custom cleanup if needed
     };
   }, []);
   ```

2. **Avoid creating forms in render**:
   ```tsx
   // ❌ Wrong - creates new form on every render
   function MyComponent() {
     const form = useForm(); // This should not be in render
     
     return <Form form={form}>...</Form>;
   }

   // ✅ Correct - form created once
   function MyComponent() {
     const form = useForm(); // This is fine, hooks are stable
     
     return <Form form={form}>...</Form>;
   }
   ```

## Debugging Tips

### Enable Debug Logging

Add debug output to understand form behavior:

```tsx
function DebugForm() {
  const form = useFormContext<MyForm>();
  const values = useFieldsWatch(form);
  const validations = useValidations(form);

  // Debug current state
  console.log('Form values:', values);
  console.log('Form validations:', validations);

  return (
    <div>
      <pre>{JSON.stringify(values, null, 2)}</pre>
      <pre>{JSON.stringify(validations, null, 2)}</pre>
    </div>
  );
}
```

### Validation Debugging

```tsx
const debugValidation = (value) => {
  console.log('Validating value:', value);
  const result = yourValidationLogic(value);
  console.log('Validation result:', result);
  return result;
};

<Rule validationFn={debugValidation} message="Debug rule" />
```

### Step Debugging for Wizards

```tsx
function WizardDebug() {
  const wizard = useWizardContext<WizardData>();
  
  return (
    <div className="debug-panel">
      <h4>Wizard Debug</h4>
      <p>Current Step: {wizard.currentStep}</p>
      <p>Is Last Step: {wizard.isLastStep.toString()}</p>
      <p>Is First Step: {wizard.isFirstStep.toString()}</p>
      <p>Is Step Ready: {wizard.isStepReady.toString()}</p>
      <p>Steps: {wizard.steps.join(', ')}</p>
      
      <pre>
        {JSON.stringify(wizard.getValuesOfSteps(), null, 2)}
      </pre>
    </div>
  );
}
```

## Error Handling

### Async Validation Errors

```tsx
const safeAsyncValidation = async (value) => {
  try {
    const result = await apiCall(value);
    return result.isValid;
  } catch (error) {
    console.error('Validation error:', error);
    // Return true to allow form submission, or false to block
    // depending on your error handling strategy
    return true;
  }
};
```

### Form Submission Errors

```tsx
function FormWithErrorHandling() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<MyForm>();

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const values = form.getFormValues();
      await submitData(values);
      // Success handling
    } catch (error) {
      setSubmitError(error.message || 'Submission failed');
    }
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      {submitError && (
        <div className="error-message">
          {submitError}
        </div>
      )}
      {/* Form fields */}
      <button type="submit">Submit</button>
    </Form>
  );
}
```

## Browser Compatibility

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Common Browser Issues

1. **Input events not firing**: Some older browsers may not support certain input events. Use `onChange` instead of `onInput` for better compatibility.

2. **Date input support**: Date inputs may not be supported in older browsers. Consider using a date picker library as fallback.

## Getting Help

If you're still experiencing issues:

1. **Check the examples** - Look at the advanced examples for similar use cases
2. **Review the API documentation** - Ensure you're using the correct types and patterns
3. **Create a minimal reproduction** - Isolate the issue in a simple example
4. **Check browser console** - Look for JavaScript errors or warnings
5. **File an issue** - Report bugs on the GitHub repository with reproduction steps