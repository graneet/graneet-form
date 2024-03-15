import { FieldValues, Step, StepValidator, WizardContext, useWizard, useWizardContext } from 'graneet-form';
import { ReactNode } from 'react';

export interface StepExampleProps<WizardValues extends Record<string, FieldValues>, Step extends keyof WizardValues> {
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
        <button onClick={wizardContext.handleOnPrevious}>Go previous step</button>
        <button onClick={wizardContext.handleOnNext}>Go next step</button>
      </div>

      <div style={{ display: 'flex', width: '100%', height: '45rem', border: '1px solid red' }}>{children}</div>
    </Step>
  );
}

export interface WizardProps<WizardValues extends Record<string, FieldValues>> {
  children: ReactNode;
  onQuit(): void | Promise<void>;
  onFinish(wizardValues: WizardValues): void;
}

function WizardExampleComponent<WizardValues extends Record<string, FieldValues>>({
  onFinish,
  onQuit,
  children,
}: WizardProps<WizardValues>) {
  const wizard = useWizard(onFinish, onQuit);

  return (
    <WizardContext.Provider value={wizard}>
      <div>The Wizard</div>
      {children}
    </WizardContext.Provider>
  );
}

export const WizardExample = Object.assign(WizardExampleComponent, {
  Step: StepExample,
});
