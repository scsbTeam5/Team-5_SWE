import React, { useState } from 'react';
// Make sure to import your CSS file
import './index.css';

const RoutePlanner = () => {
  const [currentAddress, setCurrentAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [departTime, setDepartTime] = useState('23:59');
  const [arrivalTime, setArrivalTime] = useState('00:00');

  return (
    <div className="route-planner">
      <div className="map-background"></div>
      <div className="addresses">
        <input
          className="address-input"
          type="text"
          placeholder="Current Address"
          value={currentAddress}
          onChange={(e) => setCurrentAddress(e.target.value)}
        />
        <input
          className="address-input"
          type="text"
          placeholder="Destination Address"
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
        />
      </div>
      <div className="route-info">
        <div className="time-info">
          <div className="time-info-container">
            <label>Depart Time</label>
            <input
              type="time"
              value={departTime}
              onChange={(e) => setDepartTime(e.target.value)}
            />
            <label>Arrival Time</label>
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
            />
            </div>
        </div>
        <div className="routes">
          {/* This section would dynamically list routes */}
          <div className="route">
            <div>Location Name 1</div>
            <div>1 hr 0 min - 2 hr 0 min</div>
            <div>$2 - $43</div>
            <button>Routes</button>
          </div>
          {/* Repeat for other routes */}
        </div>
      </div>
      <div className="travel-mode">
        <div className="travel-mode-container">
          <div>
            <h2>Routes</h2>
            <button className="travel-filter">Filter</button>
          </div>
            <div className="bus-container">
              <label>Bus</label>
              <label>60 km</label>
              <label>1 hour 69min</label>
              <label>$2 - $4</label>
            </div>
            <div className="mrt-container">
              <label>Mrt</label>
              <label>60 km</label>
              <label>1 hour 69min</label>
              <label>$2 - $4</label>
            </div>
            <div className="taxi-container">
              <label>Taxi</label>
              <label>60 km</label>
              <label>1 hour 69min</label>
              <label>$2 - $4</label>
            </div>
        </div>
      </div>
      <div className="filter-mode">
        <div className="filter-mode-container">
          <ul>
            <li><input type="checkbox"/>Shortest Route</li>
            <li><input type="checkbox"/>Cheapest Route</li>
            <li><input type="checkbox"/>Fewer Transfer</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
