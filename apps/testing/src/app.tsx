import type { ReactNode } from 'react';
import { useState } from 'react';
import { FieldTests } from './screens/field-tests.tsx';
import { WizardTests } from './screens/wizard-tests.tsx';

function App(): ReactNode {
  const [screen, setScreen] = useState<'form' | 'wizard'>();

  return (
    <div style={{ height: '50rem' }}>
      <button
        type="button"
        onClick={() => {
          setScreen('form');
        }}
      >
        Display form
      </button>
      <button
        type="button"
        onClick={() => {
          setScreen('wizard');
        }}
      >
        Display wizard
      </button>

      <br />
      <br />

      <div style={{ border: '1px solid gray', height: '100%', padding: '1rem' }}>
        {screen === 'form' && <FieldTests />}
        {screen === 'wizard' && <WizardTests />}
      </div>
    </div>
  );
}

export default App;
