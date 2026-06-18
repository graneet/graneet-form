import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.tsx';

// oxlint-disable-next-line jest/require-hook
ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
