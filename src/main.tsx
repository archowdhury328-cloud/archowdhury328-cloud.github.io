import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import '@fontsource/jetbrains-mono/400.css';
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const el = document.getElementById('root');
if (!el) throw new Error('Missing #root element');
// The prerendered summary inside #root is replaced when the app mounts.
createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
