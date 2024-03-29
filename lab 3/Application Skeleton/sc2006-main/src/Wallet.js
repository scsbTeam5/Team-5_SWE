import React, { useState } from 'react';
import './ManageWallet.css';
const ManageWallet = () => {
  const [monthlyFunds, setMonthlyFunds] = useState(100); // default value
  const [allowNotification, setAllowNotification] = useState(false);
  const [alertWhenLow, setAlertWhenLow] = useState(false);

  const handleUpdate = () => {
    // Logic to update the wallet settings
    console.log('Updated settings:', {
      monthlyFunds,
      allowNotification,
      alertWhenLow,
    });

    // You would typically send this data to your backend with an API call
  };

  return (
    <div className="manage-wallet-container">
      <h1>Manage Wallet</h1>
      <div className="funds-input-container">
        <label htmlFor="monthlyFunds">Monthly Funds</label>
        <input
          type="text"
          id="monthlyFunds"
          value={`$${monthlyFunds}`}
          onChange={(e) => setMonthlyFunds(e.target.value.replace(/^\$/, ''))}
        />
      </div>
      <div className="notification-checkbox">
        <input
          type="checkbox"
          id="allowNotification"
          checked={allowNotification}
          onChange={(e) => setAllowNotification(e.target.checked)}
        />
        <label htmlFor="allowNotification">Allow Notification</label>
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
