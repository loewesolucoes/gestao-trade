import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppProviders } from './contexts';
import { Loader } from './components/loader';

const Home = React.lazy(() => import("./pages/home"));
const Configuracoes = React.lazy(() => import("./pages/configuracoes"));
const AcoesPage = React.lazy(() => import("./pages/acoes"));
const FAQ = React.lazy(() => import("./pages/faq"));
const IntegracaoPage = React.lazy(() => import("./pages/integracao"));
const NotFound = React.lazy(() => import("./pages/not-found"));
const Relatorios = React.lazy(() => import("./pages/relatorios"));

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
    path: "/integracoes",
    element: <IntegracaoPage />,
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
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  </AppProviders>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
