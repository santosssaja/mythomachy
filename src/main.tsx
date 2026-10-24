import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { initMetaMask } from './services/metamaskService';
import './index.css';

// Initialize MetaMask account & chain listeners on app load
initMetaMask();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
