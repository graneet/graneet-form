import { Field, Form, Rule, useForm } from 'graneet-form';

interface FormValues {
  name: string;
  email: string;
}

export function SimpleForm() {
  const form = useForm<FormValues>();

  const onSubmit = (values: FormValues) => {
    alert(`Name: ${values.name}\nEmail: ${values.email}`);
  };

  return (
    <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
      <Field
        name="name"
        render={({ value, onChange }) => (
          <input placeholder="Name" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        )}
      >
        <Rule validationFn={(value) => !!value} message="Name is required" />
      </Field>

      <Field
        name="email"
        render={({ value, onChange }) => (
          <input type="email" placeholder="Email" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        )}
      >
        <Rule validationFn={(value) => /\S+@\S+\.\S+/.test(value || '')} message="Invalid email" />
      </Field>

      <button type="submit">Submit</button>
    </Form>
  );
}
