// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import './login.css';

// // Login form component
// const LoginForm = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = (event) => {
//     event.preventDefault();
//     // Handle login logic here
//     console.log(email, password);
//   };

//   return (
//     <div className="login-form">
//       <h2>Log In</h2>
//       <input
//         type="email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         placeholder="Email"
//       />
//       <input
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         placeholder="Password"
//       />
//       <button onClick={handleLogin}><Link to="/Home">Login</Link></button>
//       <a href="#">Forget Password?</a>
//     </div>
//   );
// };

// // Registration form component
// const RegisterForm = () => {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const handleRegister = (event) => {
//     event.preventDefault();
//     // Handle registration logic here
//     console.log(firstName, lastName, email, password, confirmPassword);
//   };

//   return (
//     <div className="register-form">
//       <h2>Register</h2>
//       <input
//         type="text"
//         value={firstName}
//         onChange={(e) => setFirstName(e.target.value)}
//         placeholder="First Name"
//       />
//       <input
//         type="text"
//         value={lastName}
//         onChange={(e) => setLastName(e.target.value)}
//         placeholder="Last Name"
//       />
//       <input
//         type="email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         placeholder="Email"
//       />
//       <input
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         placeholder="Password"
//       />
//       <input
//         type="password"
//         value={confirmPassword}
//         onChange={(e) => setConfirmPassword(e.target.value)}
//         placeholder="Confirm Password"
//       />
//       <button onClick={handleRegister}>Register</button>
//     </div>
//   );
// };

// // Main App component
// const Login = () => {
//   return (
// <div className="form-container">
//   <LoginForm />
//   <RegisterForm />
// </div>
//   );
// };

// export default Login;
import React from 'react';
import './login.css'; // Ensure this is the path to your CSS file
import { Link } from 'react-router-dom';

const Login = () => {
  // ... any required state and functions

  return (
    <div className="background-image">
    <div className="login-container">
      <div className="login-form">
        <h1>Pathfinder</h1>
        <form>
          {/* Form fields */}
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <button type="submit">Sign In</button>
          <a href="#">Forget Password?</a>
          <a href="#"><Link to='/Register'>Register</Link></a>
        </form>

      </div>
    </div>
    </div>
  );
};

export default Login;
