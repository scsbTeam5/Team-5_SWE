import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from "./firebase";
import  './Balance.css';

const Balance = () => {
    const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [user, setUser] = useState(null);
  const [isLow, setIsLow] = useState(false);
  const [enableAlerts, setEnableAlerts] = useState(false);
  useEffect(() => {
    const auth = getAuth();
    //const userDocRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
        const currentUser = auth.currentUser;
        const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            const balanceData = docSnap.data()['balance'];
            const alertLowData = docSnap.data()['alertLowAmount'];
            const enableAlertsData = docSnap.data()['enableAlerts'];
            if (balanceData <= alertLowData) {
              setIsLow(true);
            }

            const formattedBalance = parseFloat(balanceData).toFixed(2);
            await setBalance(formattedBalance);
            await setEnableAlerts(enableAlertsData);

          } else {
            console.log("No such document!");
          } 
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // User is signed out, handle accordingly
        
        setIsLoading(false);
      }
    });

    return () => unsubscribe(); // Unsubscribe from the auth state change listener when the component unmounts
  }, []); // Run only once on component mount

  if (isLoading) {
    return <p>Loading...</p>; // Display a loading indicator while checking authentication status
  }

  //let low = false;

  return (
    <div>
      {
        enableAlerts ? (isLow ? (
                          <div className = "balance-button-low">
                            <a onClick={() => {navigate("/ManageWalletBalance")}}>${balance}</a>
                          </div>
                                ) : (
                          <div className = "balance-button">
                              <a onClick={() => {navigate("/ManageWalletBalance")}}>${balance}</a>
                          </div>
                                    )
                      ) : (
                        <div className = "balance-button">

                        <a onClick={() => {navigate("/ManageWalletBalance")}}>${balance}</a>
                
                        </div>


                      )
      }
    </div>
  );
};

export default Balance;



