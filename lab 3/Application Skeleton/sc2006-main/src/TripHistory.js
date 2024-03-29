import React, { useState } from 'react';
import './TripHistory.css';

const MonthNavigator = () => {
  const [currentMonth, setCurrentMonth] = useState('Jan');

  // You could replace these with a dynamic calculation based on date objects if needed
  const previousMonth = () => {
    setCurrentMonth('Dec'); // replace with actual logic
  };

  const nextMonth = () => {
    setCurrentMonth('Feb'); // replace with actual logic
  };

  return (
    <div className="month-navigator">
      <button onClick={previousMonth}>{'<'}</button>
      <span>{currentMonth}</span>
      <button onClick={nextMonth}>{'>'}</button>
      {/* You can also include the "press to see next month's record" text as needed */}
    </div>
  );
};

const TripSummary = () => {
  return (
    <div className="trip-summary">
      <div className="trip-type">Bus $4.0</div>
      <div className="trip-type">MRT $6.0</div>
      <div className="trip-type">Taxi $24.0</div>
      <div className="trip-total">Total: $34.0</div>
    </div>
  );
};

const Trip = ({ name, date, from, to, duration, cost, status }) => {
  return (
    <div className="trip">
      <div className="trip-id">{name}</div>
      <div className="trip-date">{date}</div>
      <div className="trip-detail">
        {from} → {to} | {duration} | {cost}
      </div>
      <div className="trip-status">Status: {status}</div>
      {status === 'Ongoing' && <button>Edit</button>}
    </div>
  );
};

const TripHistory = () => {
  // This would ideally come from a backend or state management system
  const trips = [
    {
      id: '1',
      name: 'Trip 1',
      date: '24 Feb 2024',
      from: 'Test Avenue Street 11',
      to: 'Test Avenue Street 11',
      duration: '2 hr 0 min',
      cost: '$2.3',
      status: 'Ongoing',
    },
    // ... other trips
  ];

  return (
    <div className="trip-history">
      <TripSummary />
      {trips.map((trip) => (
        <Trip key={trip.id} {...trip} />
      ))}

    </div>
  );
};

const App = () => {
  return (
    <div>
      <MonthNavigator />
      <main>
        <TripHistory />
      </main>
    </div>
  );
};

export default App;
