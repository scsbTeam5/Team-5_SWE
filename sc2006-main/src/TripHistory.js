  import React, { useState, useEffect } from 'react';
  import { getFirestore, collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
  import './TripHistory.css';
  import { getAuth } from "firebase/auth";
  import { db } from "./firebase";

  const MonthNavigator = ({ currentMonth, setCurrentMonth }) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const previousMonth = () => {
      const currentIndex = months.indexOf(currentMonth);
      const previousIndex = (currentIndex - 1 + months.length) % months.length;
      setCurrentMonth(months[previousIndex]);
    };

    const nextMonth = () => {
      const currentIndex = months.indexOf(currentMonth);
      const nextIndex = (currentIndex + 1) % months.length;
      setCurrentMonth(months[nextIndex]);
    };

    return (
      <div className="month-navigator">
        <button onClick={previousMonth}>{'<'}</button>
        <span>{currentMonth}</span>
        <button onClick={nextMonth}>{'>'}</button>
      </div>
    );
  };

  const TripSummary = ({ trips }) => {
    const totals = trips.reduce((acc, trip) => {
      if (trip.transitRoutes && trip.transitRoutes.fare) {
        acc.transitTotal += parseFloat(trip.transitRoutes.fare);
      }
      if (trip.taxi && trip.taxi.fare) {
        acc.taxiTotal += parseFloat(trip.taxi.fare);
      }
      return acc;
    }, { transitTotal: 0, taxiTotal: 0 });

    const overallTotal = totals.transitTotal + totals.taxiTotal;

    return (
      <div className="trip-summary">
        <div className="trip-total">Total Transit Fare: ${totals.transitTotal.toFixed(2)}</div>
        <div className="trip-total">Total Taxi Fare: ${totals.taxiTotal.toFixed(2)}</div>
        <div className="trip-total">Overall Total Fare: ${overallTotal.toFixed(2)}</div>
      </div>
    );
  };

  const Trip = ({ trip, onUpdateStatus }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(trip.status || 'Ongoing');

    const handleStatusUpdate = async () => {
      setShowDropdown(false);
      onUpdateStatus(trip.id, selectedStatus);
    };

    return (
      <div className="trip">
        <div className="trip-date">{trip.date}</div>
        <div className="trip-detail">
          {trip.startAddress} → {trip.endAddress}
          {trip.transitRoutes && (
            <>
              <br />
              Transit: {trip.transitRoutes.duration} min - ${trip.transitRoutes.fare}
            </>
          )}
          {trip.taxi && (
            <>
              <br />
              Taxi: {trip.taxi.duration} - ${trip.taxi.fare}
            </>
          )}
        </div>
        
        <div className="trip-status">
          Status: {selectedStatus} <button onClick={() => setShowDropdown(true)}>Update</button>
          {showDropdown && (
            <div className="dropdown">
              <button onClick={() => setSelectedStatus('Ongoing')}>Ongoing</button>
              <button onClick={() => setSelectedStatus('Completed')}>Completed</button>
              <button onClick={handleStatusUpdate}>Save</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TripHistory = () => {
    const [trips, setTrips] = useState([]);
    const [newTripType, setNewTripType] = useState('');
    const [newTripCost, setNewTripCost] = useState('');
    const [currentMonth, setCurrentMonth] = useState('Apr'); // Default current month to April

    useEffect(() => {
      const fetchTrips = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const tripRef = collection(userDocRef, 'trips');
          const querySnapshot = await getDocs(tripRef);
          const tripData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTrips(tripData);
        } else {
          console.error("User is null.");
        }
      };

      fetchTrips();
    }, []);

    const handleAddTrip = async () => {
      if (trips.length >= 5) {
        alert('You can only add up to 5 trips.');
        return;
      }

      const auth = getAuth();
      const currentUser = auth.currentUser;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const tripRef = collection(userDocRef, 'trips');
      await addDoc(tripRef, { type: newTripType, cost: newTripCost, status: 'Ongoing' });
      setNewTripType('');
      setNewTripCost('');
      const newTripData = { type: newTripType, cost: newTripCost, status: 'Ongoing' };
      setTrips(prevTrips => [...prevTrips, newTripData]);
    };

    const handleUpdateStatus = async (tripId, newStatus) => {
      setTrips(prevTrips =>
        prevTrips.map(trip => (trip.id === tripId ? { ...trip, status: newStatus } : trip))
      );
    };

    return (
      <div className="trip-history">
        <MonthNavigator currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
        {currentMonth === 'Apr' && (
          <>
            <TripSummary trips={trips} />
            {trips.map((trip, index) => (
              <Trip key={index} trip={trip} onUpdateStatus={handleUpdateStatus} />
            ))}
          </>
        )}
      </div>
    );
  };

  export default TripHistory;