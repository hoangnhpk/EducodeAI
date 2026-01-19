import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import './assets/styles/bootstrap.min.css';
import './assets/styles/style.css';
import './assets/styles/UIKit.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
