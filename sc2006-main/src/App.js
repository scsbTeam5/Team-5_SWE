import React from 'react';
import {
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom';



import Header from './header';
import './App.css';
import Main from './Component';
import Current from './CurrentUser';
import ForgetPw from './ForgetPw';
import Login from './Login';
import Logout from './Logout';
import ManageProfile from './Profile';
import Register from './Register';
import TripHist from './TripHistory';
import ManageWallet from './Wallet';
import Balance from './Balance';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Home" element={<MainPage />} />
          <Route path="/About" element={<About />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/ManageProfile" element={<Profile />} />
          <Route path="/TripHistory" element={<TripHistory />} />
          <Route path="/ManageWalletBalance" element={<ManageWalletBalance />} />
          <Route path="/Logout" element={<Logout />} />
          <Route path="/Current" element={<Current />} />
          <Route path="/ForgetPw" element={<ForgetPw/>} />
          <Route path="/Balance" element={<Balance/>} />

          {/* Add other routes here */}
        </Routes>
      </div>
    </Router>
  );
};

const MainPage = () => {
  return (
    <Main/>
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

const ManageWalletBalance = () => {
  return (
    <ManageWallet />
  );
};

const userLogin = () => {
  return (
    <Login/>
  );
};

const userRegister = () => {
  return (
    <Register />
  );
};
/*
const Logout = () => {
  return (
    <Main />
  );
};
*/
export default App;