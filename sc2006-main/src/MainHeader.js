// Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CurrentUser from './CurrentUser'; // Import the CurrentUser component
import Balance from './Balance';
import Logo from './Logo.png';

const MainHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo"><Link to="/Home"><img src={Logo} alt='Logo'/></Link></div>
        <nav>
          <ul className="nav-links">
            <li><Link to="/Home">Add Trip</Link></li>
            <li><Link to="/TripHistory">Trip History</Link></li>
            <li><Link to="/ManageProfile">Edit Profile</Link></li>
            <Link to="/ManageWalletBalance"><li>Manage Wallet Balance</li></Link>
          </ul>
        </nav>
      </div>
      <div className="header-right">
        <div className="fund-info">
          <Balance />
          </div>
        <div className="user-menu">
          {/* Display the user's email if logged in, or "Login / Sign Up" link otherwise */}
          <div className="user-greeting">
            <CurrentUser />
          </div>
          <ul className="user-options">
            <Link to ="/Logout"><li>Log Out</li></Link>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;