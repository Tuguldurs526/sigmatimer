import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Ensure this file includes global styles for the application

/**
 * Entry point for the React application.
 * React 18+ uses `createRoot` as the recommended API for rendering.
 */
const rootElement = document.getElementById('root');

// Ensure the root element exists before rendering
if (!rootElement) {
  console.error('Root element not found. Ensure your HTML includes an element with id="root".');
} else {
  const root = ReactDOM.createRoot(rootElement);

  // Render the React application
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('React app initialized successfully.');
}
