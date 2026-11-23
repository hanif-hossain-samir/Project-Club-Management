import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '../css/variables.css';
import '../css/style.css';
import '../css/components.css';
import '../css/responsive.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    React.createElement(StrictMode, null, React.createElement(App, null))
  );
}
