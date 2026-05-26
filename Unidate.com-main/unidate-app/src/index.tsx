import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('PWA successfully registered!');
  },
  onUpdate: (registration) => {
    console.log('New version available!');
  }
});

reportWebVitals((metric) => {
  console.log(metric);
});
