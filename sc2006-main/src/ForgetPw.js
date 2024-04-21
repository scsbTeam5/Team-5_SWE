// ForgetPw.js
import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import './ForgetPw.css';

const ForgetPw = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
      setMessage('Please check your inbox for the instructions to reset your password.');
      // You can redirect the user to a confirmation page or show a success message here
    } catch (error) {
      console.error('Error sending password reset email:', error.message);
      // You can display an error message to the user here
    }
  };

  return (
    <div className="forget-password">
      <h1>Reset Password</h1>
      <p classname='message'>{message}</p>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </label>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ForgetPw;
