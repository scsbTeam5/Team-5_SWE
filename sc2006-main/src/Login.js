
// export default Login;
import React, {useState} from 'react';
import './login.css'; // Ensure this is the path to your CSS file
import { Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const auth = getAuth();

    signInWithEmailAndPassword(auth, formData.email, formData.password)
      .then((userCredential) => {
        // Signed in successfully
        const user = userCredential.user;
        console.log("User signed in:", user);
        
        //redirect to triphistory.js 
        window.location.href="/Home"
      })
      .catch((error) => {
        // Handle errors here
        const errorMessage = error.message;
        console.error("Sign in failed:", error.message);
        switch(error.code){
          case "auth/missing-password":
            setError('Please enter password.');
            break;
          case 'auth/invalid-credential':
            setError('Incorrect email or password.');
            break;
          default:
            setError(errorMessage);
        }
      });
  };

  return (
    <div className="background-image">
    <div className="login-container">
      <div className="login-form">
        <h1>Pathfinder</h1>
        {error && <p className="error-message">{error}</p>} 
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={handleChange}
            required
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange} 
          />
          <button type="submit">Sign In</button>
          <Link to ='/ForgetPw'>Forget Password?</Link>
          <Link to='/Register'>Register</Link>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Login;
