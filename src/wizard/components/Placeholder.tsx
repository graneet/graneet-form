import { ReactNode, useEffect } from 'react';
import { useWizardContext } from '../contexts/WizardContext';

export interface PlaceholderProps {
  placement: string;
  children: ReactNode;
}

export function Placeholder({ placement, children }: PlaceholderProps) {
  const {
    wizardInternal: { updatePlaceholderContent, resetPlaceholderContent },
  } = useWizardContext();

  useEffect(() => {
    updatePlaceholderContent(placement, children);
    return () => resetPlaceholderContent(placement);
  }, [updatePlaceholderContent, placement, children, resetPlaceholderContent]);
  return null;
}
