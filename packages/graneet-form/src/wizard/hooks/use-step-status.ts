import { useEffect, useState } from 'react';
import type { ValidationStatus } from '../../shared/types/validation';
import { useWizardContext } from '../contexts/wizard-context';

export function useStepStatus() {
  const {
    wizardInternal: { registerStepStatusListener, unregisterStepStatusListener },
  } = useWizardContext();

  const [stepStatus, setStepStatus] = useState<ValidationStatus>('valid');

  useEffect(() => {
    registerStepStatusListener(setStepStatus);
    return () => unregisterStepStatusListener(setStepStatus);
  }, [registerStepStatusListener, unregisterStepStatusListener]);

  return stepStatus;
}
