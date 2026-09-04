import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA installation support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Try relative sw registration with fallback
    const swPath = window.location.pathname.endsWith('/') 
      ? './sw.js' 
      : `${window.location.pathname.replace(/\/[^/]*$/, '')}/sw.js`;
    
    navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        console.log('The Way Service Worker active:', registration.scope);
      })
      .catch(() => {
        // Fallback to root registration
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
