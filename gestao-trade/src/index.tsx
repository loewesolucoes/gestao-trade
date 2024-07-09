import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppProviders } from './contexts';

import { Home, Configuracoes, FAQ, Relatorios } from './pages';
import { Acoes } from './pages/acoes/acoes';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/acoes",
    element: <Acoes />,
  },
  {
    path: "/relatorios",
    element: <Relatorios />,
  },
  {
    path: "/configuracoes",
    element: <Configuracoes />,
  },
  {
    path: "/perguntas-frequentes",
    element: <FAQ />,
  },
], {
  basename: process.env.NODE_ENV === 'development' ? '' : process.env.PUBLIC_URL,
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
