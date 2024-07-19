import { Link, useLocation } from "react-router-dom";
import { AuthButton } from "./auth-button";

const pages = [
  {
    name: 'Início',
    path: '/'
  },
  {
    name: 'Ações',
    path: '/acoes'
  },
  {
    name: 'Integrações',
    path: '/integracoes'
  },
  {
    name: 'Relatórios',
    path: '/relatorios'
  },
  {
    name: 'Configurações',
    path: '/configuracoes'
  },
  {
    name: 'Perguntas frequentes',
    path: '/perguntas-frequentes'
  },
];

interface CustomProps {
  show?: boolean
  className?: string
}

export function NavbarCollapse({ show, className }: CustomProps) {
  const { pathname } = useLocation();

  return <div className={`collapse navbar-collapse justify-content-between ${show && 'show'} ${className}`} id="navbarSupportedContent">
    <ul className="navbar-nav">
      {pages.map(x => (
        <li key={x.path} className="nav-item">
          <Link className={`nav-link ${pathname == x.path ? 'active' : ''}`} to={x.path}>{x.name}</Link>
        </li>
      ))}
    </ul>
    <AuthButton />
  </div>;
}
