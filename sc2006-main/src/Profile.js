import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile as updateUserProfile, updatePassword } from "firebase/auth";
import { reauthUser } from './reauth';
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import "./Profile.css";



const EditProfile = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Fetch user's information when component mounts
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser({
        firstName: currentUser.displayName ? currentUser.displayName.split(' ')[0] : '',
        lastName: currentUser.displayName ? currentUser.displayName.split(' ')[1] : '',
        email: currentUser.email
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

        try {
          await reauthUser(currentUser, user.currentPassword);
          console.log("Current Password validated");

          // Continue with the rest of the code here
        } catch (error) {
          console.error("Current Password validation failed!", error);
          setError('Current password invalid.');
          return;
        }

      const userData = {};
      if (user.firstName.trim() !== '') {
        userData.firstName = user.firstName.trim();
        await updateUserProfile(auth.currentUser, {
          displayName: userData.firstName
        });
      }
      if (user.lastName && user.lastName.trim() !== '') {
        userData.lastName = user.lastName.trim();
      }
      if (Object.keys(userData).length > 0) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, userData, { merge: true });
      }
      // Update user email if a new email is provided
      if (user.email.trim() !== '' && user.email !== currentUser.email) {
        await verifyBeforeUpdateEmail(auth.currentUser, user.email).then(() => {
          window.confirm("Please check your new email inbox to verify the new email.");
          console.log("Email updated! ", user);
        }).catch((error) => {
          console.error("Email update failed:", error.message);
        });
        try{

        } catch (error) {
          console.error('Error in handleCheckPWs:', error);
        }
      }


      const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

      // Update user password if a new password is provided
    if (user.password !== undefined){
      if (user.password.trim() !== '') {
        if (!passwordRegex.test(user.password)) {
          console.log(user.password);
          setError('Password must be at least 6 characters long and include at least one special character.');
          return;
        }
        else if (user.password !== user.confirmPassword) {
          setError('Passwords do not match.');
          console.log(user.password);

          return;
        }
        else {

        await updatePassword(currentUser, user.password).then(() => {
          console.log("Password update successful!", user);
        }).catch((error) => {
          console.error("Password update failed!", error.message);

       });
      
      }
    }
  }
      window.location.href="/TripHistory";
      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };
  

  return (
    <div className="edit-profile">
      <h1>Edit Profile</h1>
      {error && <p className="error-message">{error}</p>} 
      <br></br>
      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <input

            name="firstName"
            value={user.firstName}
            onChange={handleChange}
            placeholder='John'
          />
        </label>
        <label>
          Last Name:
          <input

            name="lastName"
            value={user.lastName}
            onChange={handleChange}
            placeholder='Doe'
          />
        </label>
        <label>
         New Email:
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder='johndoe@gmail.com'
          />
        </label>
        <label>
         * Current Password:
          <input
            type="password"
            name="currentPassword"
            value={user.currentPassword}
            onChange={handleChange}
            placeholder='Enter current password to make changes'
            required
          />
        </label>
        <label>
         New Password:
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            placeholder='Enter new password to change password'
          />
        </label>
        <label>
          Confirm Password:
          <input
            type="password"
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={handleChange}
            placeholder='Confirm new password'
          />
        </label>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default EditProfile;
