import React from 'react';
import { createRoot } from 'react-dom/client';
import PortalApp from './PortalApp.jsx';
import { DataProvider } from '../DataContext.jsx';
import '../index.css';
import './portal.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataProvider>
      <PortalApp />
    </DataProvider>
  </React.StrictMode>
);
