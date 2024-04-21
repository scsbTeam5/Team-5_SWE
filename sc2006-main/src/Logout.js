import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';

const Logout = () => {
  const [countdown, setCountdown] = useState(5); // Initial countdown time in seconds

  useEffect(() => {
    // Start the countdown timer if countdown is greater than 0
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      // Cleanup function to clear the interval when the component unmounts
      return () => clearInterval(timer);
    } else {
      // Redirect to the home page when countdown reaches 0
      window.location.href = '/';
    }
  }, [countdown]); // Run whenever countdown changes

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  // Trigger logout when the component mounts
  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <div>
      {/* Display the countdown timer and "Logging out" message */}
      {countdown > 0 ? (
        <p>Successfully logged out, redirecting in {countdown} seconds...</p>
      ) : (
        <p>Logging out...</p>
      )}
    </div>
  );
};

export default Logout;
