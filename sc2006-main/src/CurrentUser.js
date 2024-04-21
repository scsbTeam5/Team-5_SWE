import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CurrentUser = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        setUser(user);
      } else {
        // No user is signed in.
        setUser(null);
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe(); // Cleanup function to unsubscribe from the auth state listener
  }, []); // Run only once on component mount

  if (isLoading) {
    return <p>Loading...</p>; // Display a loading indicator while checking authentication status
  }

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}</p>
        </div>
      ) : (
        <div>
          <p><Link to="/Login">Log in</Link></p>      
        </div>
        )}
    </div>
  );
};

export default CurrentUser;
