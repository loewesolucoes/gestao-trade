"use client";

import Logo from "./logo.svg";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { useState } from "react";

const pages = [
  {
    name: 'Home',
    path: '/'
  },
  {
    name: 'Ações',
    path: '/stocks'
  },
]

export function Header() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  return <header className="navbar navbar-expand-sm">
    <div className="container-fluid">
      <Link
        href="/"
        rel="noopener noreferrer"
        className='navbar-brand logo-link'
      >
        <Logo className="d-inline-block align-text-top" />
        Dashboard trader
      </Link>
      <button className="navbar-toggler" type="button" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" onClick={e => setShow(!show)}>
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className={`collapse navbar-collapse ${show && 'show'}`} id="navbarSupportedContent">
        <ul className="navbar-nav">
          {pages.map(x => (
            <li key={x.path} className="nav-item">
              <Link className={`nav-link ${pathname == x.path ? 'active' : ''}`} href={x.path}>{x.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </header>;

}
