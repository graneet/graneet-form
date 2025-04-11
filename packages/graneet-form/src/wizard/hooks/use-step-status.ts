import { useEffect, useState } from 'react';
import { VALIDATION_OUTCOME } from '../../shared/types/validation';
import { useWizardContext } from '../contexts/wizard-context';

export function useStepStatus() {
  const {
    wizardInternal: { registerPlaceholder, unregisterPlaceholder },
  } = useWizardContext();

  const [stepStatus, setStepStatus] = useState<VALIDATION_OUTCOME>(VALIDATION_OUTCOME.VALID);

  useEffect(() => {
    const noop = () => {};
    registerPlaceholder(noop, setStepStatus);
    return () => unregisterPlaceholder(noop, setStepStatus);
  }, [registerPlaceholder, unregisterPlaceholder]);

  return stepStatus;
}
