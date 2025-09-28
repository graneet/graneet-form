import { Field, Form, Rule, useForm } from 'graneet-form';
import { useId } from 'react';

interface FormValues {
  name: string;
  email: string;
}

export function SimpleForm() {
  const nameId = useId();
  const emailId = useId();

  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    alert(`Form submitted with:\nName: ${values.name}\nEmail: ${values.email}`);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem' }}>
      <h1>Simple Form Example</h1>

      <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor={nameId} style={{ display: 'block', marginBottom: '0.5rem' }}>
            Name:
          </label>

          <Field<FormValues, 'name'>
            name="name"
            render={({ value, onChange, onBlur, onFocus }) => (
              <input
                id={nameId}
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                onFocus={onFocus}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            )}
          >
            <Rule validationFn={(value) => !!value && value.length > 0} message="Name is required" />
          </Field>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor={emailId} style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email:
          </label>
          <Field<FormValues, 'email'>
            name="email"
            render={({ value, onChange, onBlur, onFocus }) => (
              <input
                id={emailId}
                type="email"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                onFocus={onFocus}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            )}
          >
            <Rule
              validationFn={(value) => !!value && /\S+@\S+\.\S+/.test(value)}
              message="Please enter a valid email address"
            />
          </Field>
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </Form>
    </div>
  );
}
