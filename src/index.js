import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import theme from './theme/index';
import { ThemeProvider } from '@mui/material';
import { HashRouter } from 'react-router-dom';
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from './utils/appInsightsService';

import '@fontsource/inter/100.css';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
      <ThemeProvider theme={theme}>
         <HashRouter>
            <AppInsightsContext.Provider value={reactPlugin}>
               <App />
            </AppInsightsContext.Provider>
         </HashRouter>
      </ThemeProvider>,
);

// If you want to start measuring performance in your app, pass a function
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
