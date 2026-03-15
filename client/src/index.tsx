import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';

// ለወደፊቱ ሪፖርት ለመከታተል (አማራጭ)
// import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element. Ensure index.html has an id='root' div.");
}

const root = ReactDOM.createRoot(rootElement as HTMLElement);

root.render(
  <React.StrictMode>
    {/* 1. HelmetProvider: ለእያንዳንዱ ገጽ SEO/Title እንዲኖረው */}
    <HelmetProvider>
      {/* 2. እዚህ ጋር ሌሎች Providers (እንደ React Query) መጨመር ይቻላል */}
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// የአፑን ፍጥነት ለመለካት ከፈለግክ፡
// reportWebVitals(console.log);