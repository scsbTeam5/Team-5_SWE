import React, { useState } from 'react';
import "./Register.css";
import { getAuth, updateProfile } from "firebase/auth";
import { doc, setDoc, } from "firebase/firestore";
import { db } from "./firebase";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState(''); // State to store the error message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError(''); // Clear error message when user is typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 6 characters long and include at least one special character.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const auth = getAuth();
      await updateProfile(auth.currentUser, {
        displayName: formData.firstName
      }).then(() => {
        // Profile updated!
        console.log("First Name saved!");
      }).catch((error) => {
        // An error occurred
        console.error("First name not saved!", error.message);
      });
      const currentUser = auth.currentUser;
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        balance: 0.00
      });
      
  

      console.log('User registered successfully');
      window.location.href = "/Home";
    } catch (error) {
      console.error('Error registering user:', error);
      switch(error.code){
        case 'auth/invalid-email':
          setError('Invalid email. Please enter a valid email address.');
          break;
        case 'auth/email-already-in-use':
          setError('Email already exists. Please log in or use a different email address.');
          break;
        default:
          setError(error.message);
      }
    }
  };

  return (
    <div className="form-container">
      <h1>Register for Pathfinder</h1>
      <form onSubmit={handleSubmit} className="register-form" id="MainForm">
        {error && <p className="error-message">{error}</p>} 
        <br></br>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
          placeholder='John'
          required
        />

        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
          placeholder='Doe'
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
