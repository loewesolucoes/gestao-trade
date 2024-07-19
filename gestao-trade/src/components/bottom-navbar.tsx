import { useEnv } from "../contexts/env";

import { useState } from "react";
import { NavbarCollapse } from "./navbar-collapse";
import { Link, useLocation } from "react-router-dom";

import { ReactComponent as HouseFillIcon } from "./house-fill.svg";
import { ReactComponent as ThreeDotsIcon } from "./three-dots.svg";
import { ReactComponent as GearFillIcon } from "./gear-fill.svg";
import { ReactComponent as GraphUpArrowIcon } from "./graph-up-arrow.svg";

const pages = [
  {
    name: 'Início',
    path: '/',
    icon: <HouseFillIcon style={{ width: 22 }} />,
  },
  {
    name: 'Ações',
    path: '/acoes',
    icon: <GraphUpArrowIcon style={{ width: 22 }} />,
  },
  {
    name: 'Configurações',
    path: '/configuracoes',
    icon: <GearFillIcon style={{ width: 22 }} />,
  },
]

export function BottomNavbar() {
  const { isMobile } = useEnv();
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  return (
    isMobile
      ? (
        <>
          <footer className="bottom-navbar navbar fixed-bottom p-0 bg-light" >
            <NavbarCollapse show={show} className="px-3 py-3" />
            <div id="buttonGroup" className="btn-group selectors rounded-0 w-100 pb-3 bg-light" role="group" aria-label="Basic example">
              {pages.map(x => (
                <Link key={x.path} to={x.path} className={`btn btn-light rounded-0 ${pathname == x.path ? 'active' : ''}`}>
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    {x.icon}
                    <span>{x.name}</span>
                  </div>
                </Link>
              ))}
              <button type="button" className={`btn btn-light rounded-0`} aria-expanded="false" aria-label="Toggle navigation" onClick={e => setShow(!show)}>
                <div className="d-flex flex-column align-items-center justify-content-center">
                  <ThreeDotsIcon style={{ width: 22 }} />
                  <span>Mais</span>
                </div>
              </button>
            </div>
          </footer>
          <div className="py-5"></div>
        </>
      )
      : null

  );
}
