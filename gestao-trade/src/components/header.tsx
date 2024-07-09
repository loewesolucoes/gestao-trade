import { ReactComponent as Logo } from "./logo.svg";
import { useState } from "react";
import { NavbarCollapse } from "./navbar-collapse";
import { Link } from "react-router-dom";

export function Header() {
  const [show, setShow] = useState(false);

  return (
    <header className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link
          to="/"
          rel="noopener noreferrer"
          className='navbar-brand logo-link d-flex align-items-center'
        >
          <Logo className="d-inline-block align-text-top me-1" />
          <span className="d-none d-sm-inline">
            Trade Dashboard
          </span>
        </Link>
        <button className="navbar-toggler" type="button" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" onClick={e => setShow(!show)}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <NavbarCollapse show={show} />
      </div>
    </header>
  );
}


