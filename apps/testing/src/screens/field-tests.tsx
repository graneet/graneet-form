import { Form, useForm } from 'graneet-form';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { TextField } from '../components/text-field.tsx';

interface FormValues {
  foo: string;
}

export function FieldTests(): ReactNode {
  const [trigger, setTrigger] = useState('');
  const form = useForm<FormValues>({
    defaultValues: {
      foo: 'Victor',
    },
    onUpdateAfterBlur: () => {
      // oxlint-disable-next-line no-console
      console.log(trigger);
    },
  });

  useEffect(() => {
    // oxlint-disable-next-line no-console
    console.log('render', form);
  }, [form]);

  const onSubmit = (values: FormValues) => {
    alert(JSON.stringify(values));
    setTrigger(JSON.stringify(values));
  };

  return (
    <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
      <div>Text field test</div>
      <TextField<FormValues> name="foo" />

      <br />
      <br />
      <br />

      <button type="submit">Get values</button>
    </Form>
  );
}
