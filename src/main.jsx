import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './App.css';

const rootEl = document.getElementById('root');

const root = createRoot(rootEl);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
console.log('✅ 陈泽均作品集已就绪');
