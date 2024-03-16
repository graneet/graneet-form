import { useCallback, useState } from 'react';
import { WizardExample } from '../components/WizardExample/WizardExample.tsx';

type WizardValues = {
  step1: Record<never, never>;

  step2: Record<never, never>;
};

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
        <div style={{ background: '#869fa3' }}>Step 1</div>
      </WizardExample.Step>

      <WizardExample.Step<WizardValues> name="step2">
        <div style={{ background: '#536221' }}>Step 2</div>
      </WizardExample.Step>
    </WizardExample>
  );
}
