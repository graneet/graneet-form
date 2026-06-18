import type { FieldValues, Steps, StepValidator } from 'graneet-form';
import { Step, WizardContext, useWizard, useWizardContext } from 'graneet-form';
import type { ReactNode } from 'react';

interface StepExampleProps<WizardValues extends Record<string, FieldValues>, Step extends keyof WizardValues> {
  name: Step;
  children: ReactNode;
  onNext?: StepValidator<WizardValues, Step>;
  title?: string;
  noFooter?: boolean;
}

function StepExample<
  WizardValues extends Record<string, FieldValues>,
  Step extends keyof WizardValues = keyof WizardValues,
>({ name, onNext, title, children, noFooter }: StepExampleProps<WizardValues, Step>) {
  const wizardContext = useWizardContext();

  return (
    <Step name={name} onNext={onNext} noFooter={noFooter} title={title}>
      <div>
        <button
          type="button"
          onClick={() => {
            wizardContext.goPrevious();
          }}
        >
          Go previous step
        </button>
        <button
          type="button"
          onClick={() => {
            // oxlint-disable-next-line typescript/no-floating-promises
            wizardContext.goNext();
          }}
        >
          Go next step
        </button>
      </div>

      <div
        style={{
          border: '1px solid red',
          display: 'flex',
          height: '45rem',
          width: '100%',
        }}
      >
        {children}
      </div>
    </Step>
  );
}

interface WizardProps<WizardValues extends Record<string, FieldValues>> {
  children: ReactNode;
  onQuit: () => void | Promise<void>;
  onFinish: Steps<WizardValues>;
}

function WizardExampleComponent<WizardValues extends Record<string, FieldValues>>({
  onFinish,
  onQuit,
  children,
}: WizardProps<WizardValues>) {
  const wizard = useWizard<WizardValues>(onFinish, onQuit);

  return (
    <WizardContext value={wizard}>
      <div>The Wizard</div>
      {children}
    </WizardContext>
  );
}

export const WizardExample = Object.assign(WizardExampleComponent, {
  Step: StepExample,
});
