// Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CurrentUser from './CurrentUser'; // Import the CurrentUser component
import Logo from './Logo.png';

const LoginHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo"><img src={Logo} alt='Logo'/></div>
        <nav>
          <ul className="nav-links">
          </ul>
        </nav>
      </div>
      <div className="header-right">
        <div className="user-menu">
          {/* Display the user's email if logged in, or "Login / Sign Up" link otherwise */}
          <div className="user-greeting">
            <CurrentUser />
          </div>
        </div>
      </div>
    </header>
  );
};

export default LoginHeader;