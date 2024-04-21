import React from 'react';
import { useLocation } from 'react-router-dom';
import LoginHeader from './LoginHeader';
import MainHeader from './MainHeader';

const Header = () => {
  const location = useLocation();

  // Decide which header to show based on the current route
  const showLoginHeader = location.pathname === '/' || location.pathname === '/Login' || location.pathname === '/Register' || location.pathname === '/ForgetPw' || location.pathname === '/Logout';

  return (
    <>
      {showLoginHeader ? <LoginHeader /> : <MainHeader />}
    </>
  );
};

export default Header;