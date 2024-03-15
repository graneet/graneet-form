import { WizardExample } from '../components/WizardExample/WizardExample.tsx';

type WizardValues = {
  step1: {};

  step2: {};
};

export function WizardTests() {
  const onFinish = () => {};

  const onQuit = () => {};

  return (
    <WizardExample<WizardValues> onFinish={onFinish} onQuit={onQuit}>
      <WizardExample.Step<WizardValues> name="step1">
        <div style={{ background: '#869fa3' }}>Step 1</div>
      </WizardExample.Step>

      <WizardExample.Step<WizardValues> name="step2">
        <div style={{ background: '#536221' }}>Step 2</div>
      </WizardExample.Step>
    </WizardExample>
  );
}
