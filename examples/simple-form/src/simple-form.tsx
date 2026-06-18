import { Field, Form, Rule, useForm } from 'graneet-form';
import type { ReactNode } from 'react';

interface FormValues {
  name: string;
  email: string;
}

export function SimpleForm(): ReactNode {
  const form = useForm<FormValues>();

  const onSubmit = (values: FormValues) => {
    alert(`Name: ${values.name}\nEmail: ${values.email}`);
  };

  return (
    <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
      <Field
        name="name"
        // oxlint-disable-next-line typescript/unbound-method
        render={({ value, onChange }) => (
          <input
            placeholder="Name"
            // oxlint-disable-next-line typescript/no-unsafe-assignment
            value={value ?? ''}
            onChange={(e) => {
              onChange(e.target.value);
            }}
          />
        )}
      >
        <Rule validationFn={(value) => Boolean(value)} message="Name is required" />
      </Field>

      <Field
        name="email"
        // oxlint-disable-next-line typescript/unbound-method
        render={({ value, onChange }) => (
          <input
            type="email"
            placeholder="Email"
            // oxlint-disable-next-line typescript/no-unsafe-assignment
            value={value ?? ''}
            onChange={(e) => {
              onChange(e.target.value);
            }}
          />
        )}
      >
        <Rule
          //oxlint-disable-next-line typescript/no-unsafe-assignment typescript/no-unsafe-argument
          validationFn={(value) => /\S+@\S+\.\S+/.test(value ?? '')}
          message="Invalid email"
        />
      </Field>

      <button type="submit">Submit</button>
    </Form>
  );
}
