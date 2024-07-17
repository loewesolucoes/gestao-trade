import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppProviders } from './contexts';

import { Home, Configuracoes, FAQ, Relatorios, AcoesPage, NotFound } from './pages';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/acoes",
    element: <AcoesPage />,
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
  {
    path: "*",
    element: <NotFound />,
  },
], {
  basename: process.env.PUBLIC_URL,
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
