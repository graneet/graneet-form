import { Form, useForm } from 'graneet-form';
import { TextField } from '../components/TextField.tsx';

interface FormValues {
  foo: string;
}

export function FieldTests() {
  const form = useForm<FormValues>();

  return (
    <Form form={form}>
      <div>Text field test</div>
      <TextField<FormValues> name="foo" />

      <br />
      <br />
      <br />

      <button
        type="button"
        onClick={() => {
          alert(JSON.stringify(form.getFormValues()));
        }}
      >
        Get values
      </button>
    </Form>
  );
}
