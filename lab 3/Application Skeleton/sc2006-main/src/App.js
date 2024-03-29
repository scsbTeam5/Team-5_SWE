import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import './App.css';
import Header from './header';
import Main from './Component';
import ManageWallet from './Wallet';
import Login from './Login';
import TripHist from './TripHistory';
import ManageProfile from './Profile';
import Register from './Register';

const App = () => {
  return (
    <Router>
      <div className="app-container">
      <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Home" element={<MainPage />} />
          <Route path="/About" element={<About />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/ManageProfile" element={<Profile />} />
          <Route path="/TripHistory" element={<TripHistory />} />
          <Route path="/ManageWalletBalance" element={<ManageWalletBalance />} />
          <Route path="/Logout" element={<Logout />} />
          {/* Add other routes here */}
        </Routes>
      </div>
    </Router>
  );
};

const MainPage = () => {
  return (
    <Main />
  );
};
const About = () => {
  return (
    <Main />
  );
};
const Contact = () => {
  return (
    <Main />
  );
};
const Profile = () => {
  return (
    <ManageProfile />
  );
};
const TripHistory = () => {
  return (
    <TripHist />
  );
};
/*test*/
const ManageWalletBalance = () => {
  return (
    <ManageWallet />
  );
};

const userLogin = () => {
  return (
    <Login />
  );
};

const userRegister = () => {
  return (
    <Register />
  );
};

const Logout = () => {
  return (
    <Main />
  );
};

export default App;