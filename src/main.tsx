// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css'
import './index.css'
// import AppWrapper from './AppWrapper.tsx'
import App from './App.tsx'

// Web Vitals for performance monitoring
if (import.meta.env.PROD) {
  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB }) => {
    onCLS(console.log);
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
  });
}

// Service worker temporarily disabled due to Chrome caching issues
// Uncomment when ready to re-enable
/*
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW registration failed:', error));
  });
}
*/

const rootElement = document.getElementById('root');

if (rootElement) {
  console.log('Root element found, rendering app');
  try {
    createRoot(rootElement).render(
      // Temporarily remove StrictMode to test
      // <StrictMode>
        <App />
      // </StrictMode>,
    )
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
  }
} else {
  console.error('Root element not found!');
}
