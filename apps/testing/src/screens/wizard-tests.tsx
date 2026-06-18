import { Form, useStepForm } from 'graneet-form';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { TextField } from '../components/text-field.tsx';
import { WizardExample } from '../components/wizard-example/wizard-example.tsx';

type WizardValues = {
  step1: {
    text: string;
  };

  step2: Record<never, never>;
};

function Step1(): ReactNode {
  const { form } = useStepForm<WizardValues, 'step1'>({
    defaultValues: {
      text: 'step1',
    },
  });

  return (
    <Form form={form}>
      <TextField<WizardValues['step1']> name="text" />
      Step 1
    </Form>
  );
}

function Step2(): ReactNode {
  return <div style={{ background: '#869fa3' }}>Step 2</div>;
}

export function WizardTests(): ReactNode {
  const [message, setMessage] = useState('');

  const onFinish = useCallback(
    (wizardValues: WizardValues) => {
      // oxlint-disable-next-line no-console
      console.info('WizardValues', wizardValues);
      // oxlint-disable-next-line no-console
      console.info('Message', message);
    },
    [message],
  );

  const onQuit = useCallback(() => {
    // NOOP
  }, []);

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
