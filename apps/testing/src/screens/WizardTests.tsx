import { Form, useStepForm } from 'graneet-form';
import { useCallback, useState } from 'react';
import { TextField } from '../components/TextField.tsx';
import { WizardExample } from '../components/WizardExample/WizardExample.tsx';

type WizardValues = {
  step1: {
    text: string;
  };

  step2: Record<never, never>;
};

export function Step1() {
  const { form } = useStepForm<WizardValues, 'step1'>({
    defaultValues: {
      text: 'step1',
    },
  });

  return (
    <Form form={form} style={{ background: '#869fa3' }}>
      <TextField<WizardValues['step1']> name={'text'} />
      Step 1
    </Form>
  );
}

export function Step2() {
  return <div style={{ background: '#869fa3' }}>Step 2</div>;
}

export function WizardTests() {
  const [message, setMessage] = useState('');

  const onFinish = useCallback(
    (wizardValues: WizardValues) => {
      console.info('WizardValues', wizardValues);
      console.info('Message', message);
    },
    [message],
  );

  const onQuit = useCallback(() => {}, []);

  return (
    <WizardExample<WizardValues> onFinish={onFinish} onQuit={onQuit}>
      <WizardExample.Step<WizardValues>
        name="step1"
        onNext={() => {
          setMessage('Step1 passed !');
          return true;
        }}
      >
        <Step1 />
      </WizardExample.Step>

      <WizardExample.Step<WizardValues> name="step2">
        <Step2 />
      </WizardExample.Step>
    </WizardExample>
  );
}
