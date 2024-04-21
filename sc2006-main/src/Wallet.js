import React, { useState } from 'react';
import { doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";

import './ManageWallet.css';
const ManageWallet = () => {
  const [monthlyFunds, setMonthlyFunds] = useState(100); // default value
  const [alertWhenLow, setAlertWhenLow] = useState(false);
  
  const handleMonthlyFundsChange = (e) => {
    let value = e.target.value;
    // Remove any non-numeric characters except periods
    value = value.replace(/[^0-9.]/g, '');
    // Parse the value as a float
    const numericValue = parseFloat(value);
    // Update the state only if the value is a valid number or empty string
    if (!isNaN(numericValue) || value === '') {
      setMonthlyFunds(numericValue);
    }
  };

  const handleUpdate = async (e) => {
    // Logic to update the wallet settings
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const tenPercentThreshold = 0.1*monthlyFunds;

    if (!Number.isNaN(monthlyFunds)) {
      await updateDoc(userDocRef, {
        balance: monthlyFunds,
        alertLowAmount: tenPercentThreshold,
        enableAlerts: alertWhenLow
      });
      console.log('balance is updated, monthlyfunds is:', monthlyFunds);
    } else {
      await updateDoc(userDocRef, {
        enableAlerts: alertWhenLow
      });
    }
    window.location.reload();

  };

  return (
    <div className="manage-wallet-container">
      <h1>Manage Wallet</h1>
      <div className="funds-input-container">
        <label htmlFor="monthlyFunds">Set Monthly Funds</label>
        <input
          type="text"
          id="monthlyFunds"
          value={`$${monthlyFunds}`}
          onChange={handleMonthlyFundsChange}
        />
      </div>
      <div className="alert-checkbox">
        <input
          type="checkbox"
          id="alertWhenLow"
          checked={alertWhenLow}
          onChange={(e) => setAlertWhenLow(e.target.checked)}
        />
        <label htmlFor="alertWhenLow">Alert When Fund Below 10%</label>
      </div>
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default ManageWallet;
