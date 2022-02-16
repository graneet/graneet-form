import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { VALIDATION_OUTCOME } from '../../shared';
import { PlaceholderContent } from '../types';
import { useWizardContext } from '../contexts/WizardContext';

interface UsePlaceholder {
  handleOnNext: () => void,
  handleOnPrevious: () => void,
  placeholderContent: PlaceholderContent,
  isLoading: boolean,
  stepStatus: VALIDATION_OUTCOME,
}
export function usePlaceholder(): UsePlaceholder {
  const {
    handleOnNext,
    handleOnPrevious,
    registerPlaceholder,
    unregisterPlaceholder,
  } = useWizardContext();

  const [placeholderContent, setPlaceholderContent] = useState<PlaceholderContent>({} as PlaceholderContent);
  const [isLoading, setIsLoading] = useState(false);
  const [
    stepStatus,
    setStepStatus,
  ] = useState<VALIDATION_OUTCOME>(VALIDATION_OUTCOME.VALID);

  useEffect(() => {
    registerPlaceholder(setPlaceholderContent, setStepStatus);
    return () => unregisterPlaceholder(setPlaceholderContent, setStepStatus);
  }, [registerPlaceholder, unregisterPlaceholder, setPlaceholderContent, setStepStatus]);

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
