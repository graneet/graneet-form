import { Form, useForm } from 'graneet-form';
import { useFormContext, useOnBlurValues, useOnChangeValues } from 'graneet-form/src';
import { useEffect, useState } from 'react';
import { TextField } from '../components/TextField.tsx';

interface FormValues {
  foo: string;
}

const OnChangeWatched = () => {
  const form = useFormContext<FormValues>();
  const { foo } = useOnChangeValues(form, ['foo']);

  return foo;
};

const OnBlurWatched = () => {
  const form = useFormContext<FormValues>();
  const { foo } = useOnBlurValues(form, ['foo']);

  return foo;
};

export function FieldTests() {
  const [trigger, setTrigger] = useState('');
  const form = useForm<FormValues>({
    onUpdateAfterBlur: () => {
      console.log(trigger);
    },
    defaultValues: {
      foo: 'Victor',
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
    <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
      <div>Text field test</div>
      <TextField<FormValues> name="foo" />

      <br />
      <br />
      <br />

      <OnChangeWatched />
      <OnBlurWatched />

      <button type="submit">Get values</button>
    </Form>
  );
}
