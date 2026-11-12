import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __APP_MOUNTED__?: boolean;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  window.__APP_MOUNTED__ = true;
  sessionStorage.removeItem('__cr_reloaded');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
