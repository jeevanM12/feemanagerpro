import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Suppress defaultProps warnings from 3rd party libraries (like Recharts)
// These warnings are informational regarding future React versions and do not affect current functionality.
const originalError = console.error;
console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && /defaultProps/.test(args[0])) {
    return;
  }
  originalError(...args);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);