import { useState } from 'react';
import { FieldTests } from './screens/FieldTests.tsx';
import { WizardTests } from './screens/WizardTests.tsx';

function App() {
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

      <div style={{ height: '100%', border: '1px solid gray', padding: '1rem' }}>
        {screen === 'form' && <FieldTests />}
        {screen === 'wizard' && <WizardTests />}
      </div>
    </div>
  );
}

export default App;
