import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { NavigationProvider } from './context/NavigationContext.jsx';
import { BrowserRouter } from 'react-router-dom'; // 1. Importe o BrowserRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envolva tudo com o BrowserRouter */}
    <BrowserRouter>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </BrowserRouter>
  </React.StrictMode>
);