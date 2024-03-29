import { useCallback, useEffect, useState } from 'react';
import { VALIDATION_OUTCOME } from '../../shared/types/Validation';
import { useWizardContext } from '../contexts/WizardContext';
import type { PlaceholderContent } from '../types/PlaceholderContent';

interface UsePlaceholder {
  handleOnNext(): void;
  handleOnPrevious(): void;
  placeholderContent: PlaceholderContent;
  isLoading: boolean;
  stepStatus: VALIDATION_OUTCOME;
}

export function usePlaceholder(): UsePlaceholder {
  const {
    handleOnNext,
    handleOnPrevious,
    wizardInternal: { registerPlaceholder, unregisterPlaceholder },
  } = useWizardContext();

  const [placeholderContent, setPlaceholderContent] = useState<PlaceholderContent>({});
  const [isLoading, setIsLoading] = useState(false);
  const [stepStatus, setStepStatus] = useState<VALIDATION_OUTCOME>(VALIDATION_OUTCOME.VALID);

  useEffect(() => {
    registerPlaceholder(setPlaceholderContent, setStepStatus);
    return () => unregisterPlaceholder(setPlaceholderContent, setStepStatus);
  }, [registerPlaceholder, unregisterPlaceholder]);

  const onNext = useCallback(async () => {
    setIsLoading(true);
    await handleOnNext();
    setIsLoading(false);
  }, [handleOnNext]);

  return {
    handleOnNext: onNext,
    handleOnPrevious,
    placeholderContent,
    isLoading,
    stepStatus,
  };
}
