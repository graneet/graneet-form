import { useEffect, useState } from 'react';
import { VALIDATION_OUTCOME } from '../../shared/types/validation';
import { useWizardContext } from '../contexts/wizard-context';

export function useStepStatus() {
  const {
    wizardInternal: { registerStepStatusListener, unregisterStepStatusListener },
  } = useWizardContext();

  const [stepStatus, setStepStatus] = useState<VALIDATION_OUTCOME>(VALIDATION_OUTCOME.VALID);

  useEffect(() => {
    registerStepStatusListener(setStepStatus);
    return () => unregisterStepStatusListener(setStepStatus);
  }, [registerStepStatusListener, unregisterStepStatusListener]);

  return stepStatus;
}
