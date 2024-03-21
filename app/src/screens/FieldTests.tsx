import { Form, useForm } from 'graneet-form';
import { useEffect, useState } from 'react';
import { TextField } from '../components/TextField.tsx';

interface FormValues {
  foo: string;
}

export function FieldTests() {
  const [trigger, setTrigger] = useState('');
  const form = useForm<FormValues>({
    onUpdateAfterBlur: () => {
      console.log(trigger);
    },
  });

  useEffect(() => {
    console.log('render', form);
  }, [form]);

  const onSubmit = (values: FormValues) => {
    alert(JSON.stringify(values));
    setTrigger(JSON.stringify(values));
  };

  return (
    <Form form={form} onSubmit={form.experimental_handleSubmit(onSubmit)}>
      <div>Text field test</div>
      <TextField<FormValues> name="foo" />

      <br />
      <br />
      <br />

      <button type="submit">Get values</button>
    </Form>
  );
}
