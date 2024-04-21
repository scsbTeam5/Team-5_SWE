import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './index.css';
import PromptLocationPermission from './promptLocationPermission.js';
import { doc, collection, updateDoc, increment, addDoc, serverTimestamp} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";

const RoutePlanner = () => {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [filterOption, setFilterOption] = useState('fastest'); // Default filter option
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [startCoordinates, setStartCoordinates] = useState(null); // Declare startCoordinates state
  const [endCoordinates, setEndCoordinates] = useState(null); // Declare startCoordinates state
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [cookie, setCookie] = useState('');
  const [currentAddress, setCurrentAddress] = useState(null); // State for building name
  const [nearestTaxi, setNearestTaxi] = useState(null);
  const [taxiDuration, setTaxiDuration] = useState(null);
  const [taxiDistance, setTaxiDistance] = useState(null);
  const [taxiFare, setTaxiFare] = useState(null);
  const [date, setDate] = useState('04-16-2024');
  const [time, setTime] = useState('030000');
  const [routesFetched, setRoutesFetched] = useState(false); // New state to track if routes have been fetched
  const [transitRoutes, setTransitRoutes] = useState([]);



  useEffect(() => {
    if (routes.length > 0) {
      // Apply filter on routes when routes state updates
      filterRoutes();
    }
  }, [routes, filterOption]);

  useEffect(() => {
    if (location.latitude !== null && location.longitude !== null) {
      fetchLocationDetails(location.latitude, location.longitude);
    }
  }, [location]);

  useEffect(() => {
    if (currentAddress) {
      setStartAddress(currentAddress);
    }
  }, [currentAddress]);


  //Fetch location details
  const fetchLocationDetails = (latitude, longitude) => {
    axios.post('https://www.onemap.gov.sg/api/auth/post/getToken', {
      email: "YONG0257@e.ntu.edu.sg",
      password: "Sc2006sc2006"
    })
      .then(response => {
        const authorizationToken = response.data.access_token;

        const myHeaders = new Headers();
        myHeaders.append("Authorization", authorizationToken); // Use the fetched authorization token
        myHeaders.append("Cookie", "_toffsuid=rB8E8GYadhQiED8MBsoLAg==");

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        };

        fetch(`https://www.onemap.gov.sg/api/public/revgeocode?location=${latitude},${longitude}&buffer=50&addressType=All&otherFeatures=N`, requestOptions)
          .then((response) => response.json()) // Parse response as JSON
          .then((result) => {
            if (result.GeocodeInfo && result.GeocodeInfo.length > 0) { // Check if GeocodeInfo exists and is not empty
              const firstEntry = result.GeocodeInfo[0];
              const buildingName = firstEntry.BUILDINGNAME !== 'NIL' ? firstEntry.BUILDINGNAME : '';
              const block = firstEntry.BLOCK !== 'NIL' ? firstEntry.BLOCK : '';
              const road = firstEntry.ROAD !== 'NIL' ? firstEntry.ROAD : '';
              const currentAddress = [buildingName, block, road].join(' ').trim();
              setCurrentAddress(currentAddress); // Update the currentAddress state
              setStartAddress(currentAddress); // Update the startAddress state
            } else {
              console.error('GeocodeInfo is empty or undefined.');
            }
          })
          .catch((error) => console.error(error));
      })
      .catch(error => {
        console.error('Error fetching authorization token:', error);
      });
  };


  //fetchcoordinates first

  const fetchCoordinates = (authorizationToken, startAddress, endAddress) => {
    const requestOptions = {
      headers: {
        Authorization: authorizationToken,
        Cookie: "_toffsuid=rB8E8GYL5xNLXUnGBoCUAg=="
      }
    };

    const startUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(startAddress)}&returnGeom=Y&getAddrDetails=Y`;
    const endUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(endAddress)}&returnGeom=Y&getAddrDetails=Y`;

    return Promise.all([
      axios.get(startUrl, requestOptions),
      axios.get(endUrl, requestOptions)
    ]).then(([startResponse, endResponse]) => {
      const startResult = startResponse.data.results[0];
      const endResult = endResponse.data.results[0];

      const startCoordinates = {
        latitude: parseFloat(startResult.LATITUDE),
        longitude: parseFloat(startResult.LONGITUDE),
        postal: parseInt(startResult.POSTAL)
      };
      const endCoordinates = {
        latitude: parseFloat(endResult.LATITUDE),
        longitude: parseFloat(endResult.LONGITUDE),
        postal: parseInt(endResult.POSTAL)
      };

      return { startCoordinates, endCoordinates };
    });
  };

  //once get route button clicked : 
  const handleFetchRoutes = () => {
    axios.post('https://www.onemap.gov.sg/api/auth/post/getToken', {
      email: "YONG0257@e.ntu.edu.sg",
      password: "Sc2006sc2006"
    }).then(response => {
      const authorizationToken = response.data.access_token;
      setAuthorizationToken(authorizationToken);

      // Fetch coordinates first
      fetchCoordinates(authorizationToken, startAddress, endAddress)
        .then(({ startCoordinates, endCoordinates }) => {
          setStartCoordinates(startCoordinates);
          setEndCoordinates(endCoordinates);

          // Once coordinates are set, fetch PT data, Taxi data, and Route data concurrently
          return Promise.all([
            fetchPTData(authorizationToken, startAddress, endAddress, date, time, startCoordinates, endCoordinates),
            fetchTaxiData(startCoordinates),  // Assuming fetchTaxiData only needs startCoordinates
            fetchRouteData(startCoordinates, endCoordinates)  // Assuming fetchRouteData needs both
          ]);
        })
        .then(([ptData, taxiData, routeData]) => {
          console.log("Data fetched successfully for all tasks.");
        })
        .catch(error => {
          console.error('Error after fetching coordinates:', error);
        });

      setRoutesFetched(true);
    }).catch(error => {
      console.error('Error fetching authorization token:', error);
    });
  };

  const fetchPTData = (authorizationToken, startAddress, endAddress, date, time, startCoordinates, endCoordinates) => {
    const requestOptions = {
        headers: {
            Authorization: authorizationToken,
            Cookie: "_toffsuid=rB8E8GYL5xNLXUnGBoCUAg=="
        }
    };

    // Ensure the URL is constructed correctly with all parameters
    const routeUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${startCoordinates.latitude},${startCoordinates.longitude}&end=${endCoordinates.latitude},${endCoordinates.longitude}&routeType=pt&date=${date}&time=${time}&mode=TRANSIT&numItineraries=2`;

    return axios.get(routeUrl, requestOptions)
        .then(routeResponse => {
            const result = routeResponse.data;

            if (result.plan && result.plan.itineraries) {
                // Sorting itineraries based on duration (fastest route first)
                const sortedByDuration = result.plan.itineraries.sort((a, b) => a.duration - b.duration);
                
                // Sorting itineraries based on fare (cheapest route first)
                const sortedByFare = sortedByDuration.sort((a, b) => a.fare - b.fare);

                const routesWithFareAndDuration = sortedByFare.map(itinerary => ({
                    ...itinerary,
                    duration: Math.round(itinerary.duration / 60), // Convert duration to minutes
                    fare: itinerary.fare
                }));

                setTransitRoutes(routesWithFareAndDuration); // Update transitRoutes with duration and fare
                setRoutes(sortedByFare); // Update routes state
            } else {
                console.log("No itineraries found.");
                setRoutes([]);
                setTransitRoutes([]); // Clear transitRoutes if no itineraries are found
            }
        })
        .catch(error => {
            console.error('Error fetching routes:', error);
            // Handle error state if needed
        });
};
  ///////////////////////////////////////////////////////////////////////////////////////////////
  const fetchTaxiData = (startCoordinates) => {
    const taxiHeaders = new Headers();
    taxiHeaders.append("AccountKey", "Q+WtW6O7Rp+w6O3VR9pCqQ==");
    taxiHeaders.append("accept", "application/json");

    const taxiRequestOptions = {
      method: "GET",
      headers: taxiHeaders,
      redirect: "follow"
    };

    fetch("http://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability", taxiRequestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((taxiData) => {
        if (taxiData) {
          // const taxiData = data.value.map(taxi => ({
          //     latitude: taxi.Latitude,
          //     longitude: taxi.Longitude
          // }));
          const nearestTaxi = findNearestTaxi(startCoordinates, taxiData);
          fetchTaxiName(nearestTaxi);
        } else {
          console.error("Error: Empty or incomplete response from server when fetching taxi availability data.");
        }
      })
      .catch((error) => console.error("Error fetching taxi availability data:", error));
  };


  const findNearestTaxi = (startCoordinates, taxiData) => {
    //const distances = taxiData.map(coordinate => calculateDistance(startCoordinates, coordinate));
    const taxiCoordinates = taxiData.value.map(taxi => ({
      latitude: taxi.Latitude,
      longitude: taxi.Longitude
    }));

    // calculate distances between start coordinates and each taxi
    const distances = taxiCoordinates.map(coordinate => calculateDistance(startCoordinates, coordinate));
    const nearestTaxiIndex = distances.indexOf(Math.min(...distances));
    return taxiData[nearestTaxiIndex];
  };

  const calculateDistance = (coords1, coords2) => {
    const earthRadiusKm = 6371;
    const dLat = degreesToRadians(coords2.latitude - coords1.latitude);
    const dLon = degreesToRadians(coords2.longitude - coords1.longitude);
    const lat1 = degreesToRadians(coords1.latitude);
    const lat2 = degreesToRadians(coords2.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  };

  const degreesToRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const fetchTaxiName = (taxiCoordinates) => {
    const url = `https://www.onemap.gov.sg/api/public/revgeocode?location=${taxiCoordinates.latitude},${taxiCoordinates.longitude}&buffer=50`;

    // Set headers using Headers API
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${authorizationToken}`);
    headers.append("Cookie", cookie);
    headers.append("Content-Type", "application/json");

    const requestOptions = {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    };

    fetch(url, requestOptions)
      .then(response => response.json())
      .then(result => {
        if (result.GeocodeInfo && result.GeocodeInfo.length > 0) {
          const addressInfo = result.GeocodeInfo[0];
          const buildingName = addressInfo.BUILDINGNAME || "N/A";
          const block = addressInfo.BLOCK || "N/A";
          const road = addressInfo.ROAD || "N/A";

          const formattedAddress = `${buildingName}, ${block}, ${road}`;
          //console.log("Nearest taxi address components:", formattedAddress);
          setNearestTaxi(formattedAddress);
        } else {
          console.log("No address information available for the nearest taxi.");
        }
      })
      .catch(error => {
        console.error("Error fetching taxi name:", error);
      });
  }


  const fetchRouteData = (startCoordinates, endCoordinates) => {
    // Construct the URL for routing
    const routeUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${startCoordinates.latitude},${startCoordinates.longitude}&end=${endCoordinates.latitude},${endCoordinates.longitude}&routeType=drive&date=${date}&time=${time}`;

    const routeHeaders = new Headers();
    routeHeaders.append("Authorization", authorizationToken);
    routeHeaders.append("Cookie", cookie);

    const routeRequestOptions = {
      method: "GET",
      headers: routeHeaders,
      redirect: "follow"
    };

    // Fetch route data
    fetch(routeUrl, routeRequestOptions)
      .then(response => response.json())
      .then((data) => {
        if (!data.route_summary) {
          console.error('No route summary available');
          return;
        }

        // Extract top result
        const topResult = data.route_summary;
        const totalDistance = (topResult.total_distance / 1000).toFixed(2); // Convert meters to kilometers
        const totalTimeSeconds = topResult.total_time;
        const hours = Math.floor(totalTimeSeconds / 3600);
        const minutes = Math.floor((totalTimeSeconds % 3600) / 60);

        // Update state with route distance and duration
        setTaxiDistance(totalDistance);  //km 
        setTaxiDuration(`${hours} hours ${minutes} minutes`);

        // Calculate fare using total distance
        const fare = calculateTaxiFare(taxiDistance, time, date); // Assuming isPublicHoliday is a boolean
        setTaxiFare(fare.toFixed(2)); // Set fare to two decimal places
      })
      .catch((error) => {
        console.error('Error fetching route data:', error);
      });
  };

  const publicHolidaysSet = new Set([
    '01-01-2024', '02-10-2024', '02-11-2024', '02-12-2024', '03-29-2024',
    '04-10-2024', '05-01-2024', '05-22-2024', '06-17-2024', '08-09-2024',
    '10-31-2024', '12-25-2024'
  ]);

  function isPublicHoliday(date) {
    return publicHolidaysSet.has(date);
  }


  function calculateTaxiFare(distance, time, date) {
    const baseFare = 4.50;
    let distanceUnitFare = 0;
    const holiday = isPublicHoliday(date)

    if (distance <= 10) {
      distanceUnitFare = Math.ceil(distance * 1000 / 400) * 0.25;
    } else {
      distanceUnitFare = Math.ceil(10 * 1000 / 400) * 0.25 + Math.ceil((distance - 10) * 1000 / 350) * 0.25;
    }

    let fareMultiplier = 1;
    const hour = parseInt(time.slice(0, 2));

    if (hour >= 6 && hour < 9 && !holiday) {
      fareMultiplier += 0.25; // Morning peak on weekdays
    }
    if (hour >= 17 && hour < 20 && !holiday) {
      fareMultiplier += 0.25; // Evening peak on weekdays
    }
    if (hour >= 0 && hour < 6) {
      fareMultiplier += 0.5; // Late night hiring
    }

    const totalFare = (baseFare + distanceUnitFare) * fareMultiplier;
    return totalFare;
  }



  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };
  const filterRoutes = () => {
    if (filterOption === 'fastest') {
      // Sort routes by duration in ascending order
      const sortedRoutes = [...routes].sort((a, b) => a.duration - b.duration);
      setFilteredRoutes(sortedRoutes);
    } else if (filterOption === 'cheapest') {
      // Sort routes by fare in descending order
      const sortedRoutes = [...routes].sort((a, b) => a.fare - b.fare);
      setFilteredRoutes(sortedRoutes);
    }
  };
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0'); // Zero-padded hours
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Zero-padded minutes
    const seconds = date.getSeconds().toString().padStart(2, '0'); // Zero-padded seconds
    return `${hours}:${minutes}:${seconds}`; // Return the formatted time
  };

  const transitContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    flex: 1,
    marginRight: '10px',
    padding: '10px',
    borderRadius: '10px',
    backgroundColor: '#f0f0f0'
  };

  const itineraryStyle = {
    flex: '1 1 45%',
    margin: '10px',
    padding: '10px',
    borderRadius: '10px',
    backgroundColor: '#f0f0f0'
  };

  const calculateFareAndDuration = () => {
    return filteredRoutes.map((route, index) => ({
        routeNumber: index +1,
        fare: route.fare,
        duration: Math.round(route.duration / 60) // Convert duration to minutes
    }));
};

const updateTransitRoutes = () => {
  const routes = calculateFareAndDuration(); // Fetch the current route details
  setTransitRoutes(routes); // Store it in state
};

const handleAddTrip = async (index, mode) => {
  // Prompt user for confirmation
  const confirmFetch = window.confirm("Confirm add trip?");
  
  // If user confirms
  if (confirmFetch) {
    // Assuming calculateFareAndDuration has been called and transitRoutes are updated
    const selectedRoute = transitRoutes[transitRoutes.length - 1 -index];

    //------------Logic for deducting balance----------------------
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const userDocRef = doc(db, 'users', currentUser.uid); // Reference to the user's document
    const tripsCollectionRef = collection(userDocRef, 'trips'); // Reference to the 'trips' subcollection within the user's document
      
    if (mode === "transit") {
      // If transit fare is greater than 0, deduct the fare from the balance
      if (selectedRoute.fare > 0) {
        await updateDoc(userDocRef, {
          balance: increment(-selectedRoute.fare)
        });
      }
    } else if (mode === "taxi") {
      // Deduct taxi fare from the balance
      await updateDoc(userDocRef, {
        balance: increment(-taxiFare)
      });
    }
    //-------------------------------------------------------------

    // Create a new trip object to store in the database
    const newTrip = {
      startAddress,
      endAddress,
      transitRoutes: mode === "transit" ? {
        fare: selectedRoute.fare, // Explicitly setting the fare
        duration: selectedRoute.duration // Explicitly setting the duration
      } : null,
      taxi: mode === "taxi" ? {
        fare: taxiFare, // Taxi fare from state
        duration: taxiDuration // Taxi duration from state
      } : null,
      timestamp: serverTimestamp() // Add a timestamp for when the trip was added
    };
    try {
      // Reference to the Firestore collection for the current user's trips
      // Add the new trip to the Firestore subcollection
      const docRef = await addDoc(tripsCollectionRef, newTrip);
          
      console.log("Trip added with ID: ", docRef.id);
      console.log("index for tripDB selected is: ", index);
          
      // Delay the redirection to the trip history page by 2 seconds (2000 milliseconds)
      setTimeout(() => {
        window.location.href = "/Component";
      }, 2000);
          
      window.location.href = "/TripHistory";
    } catch (error) {
      console.error("Error adding trip: ", error);
    }
  }
};

  return (
    <div className="route-planner">
      <PromptLocationPermission setLocation={setLocation} />

      <div className="map-container" style={{ flex: 1 }}>
        <div className="map-background">
          {startCoordinates && endCoordinates ? (
            <iframe
              src={`https://www.onemap.gov.sg/amm/amm.html?mapStyle=Default&zoomLevel=15&marker=postalcode:${startCoordinates.postal}!colour:red!rType:TRANSIT!rDest:${startCoordinates.latitude},${startCoordinates.longitude}&marker=postalcode:${endCoordinates.postal}!colour:red!rType:TRANSIT!rDest:${endCoordinates.latitude},${endCoordinates.longitude}&popupWidth=200`}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              style={{ width: '100%', height: '800px' }}
            ></iframe>
          ) : (
            <iframe
              src="https://www.onemap.gov.sg/amm/amm.html?mapStyle=Default&zoomLevel=15&popupWidth=200"
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              style={{ width: '100%', height: '800px' }}
            ></iframe>
          )}
        </div>
      </div>

      <div className='input-and-map-container' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className='address-inputs' style={{ width: '300px' }}>
          <div>
            <label htmlFor="startAddress"><strong>Start Address</strong></label>
            <input
              id="startAddress"
              type="text"
              placeholder="Start Address"
              value={currentAddress}
              required
              onChange={(e) => setStartAddress(e.target.value)}
            />
          </div>
          <br />
          <div>
            <label htmlFor='endAddress'><strong>End Destination</strong></label>
            <input
              type="text"
              placeholder="End Address"
              value={endAddress}
              required
              onChange={(e) => setEndAddress(e.target.value)}
            />
          </div>
          <button onClick={handleFetchRoutes} style={{ margin: '10px 16px', display: 'block', float: 'left' }}>
            Get routes
          </button>
          <br />
          {/* Filter options */}
          <div className="filter-options">
            <label>Fastest Route</label>
            <input
              type="radio"
              value="fastest"
              checked={filterOption === 'fastest'}
              onChange={handleFilterChange}
            />
            <label>Cheapest Route</label>
            <input
              type="radio"
              value="cheapest"
              checked={filterOption === 'cheapest'}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      <div className="route-taxi-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        {/* Transit Container */}
        <div className="transit-container" style={{ ...transitContainerStyle, flex: 1, marginRight: '10px', padding: '10px', borderRadius: '10px', backgroundColor: '#f0f0f0' }}>
          {filteredRoutes.map((route, index) => (
            <div key={index} className="itinerary" style={itineraryStyle}>
              <h1>Transit</h1>
              <p><strong>Route {index + 1}</strong></p>
              <p><strong>Duration (minutes):</strong> {Math.round(route.duration / 60)}</p>
              <p><strong>Fare:</strong> ${route.fare}</p>
              <button onClick={() => handleAddTrip(index, "transit")}>Select</button>
              <br /><br />
              <div className="legs">
                {route.legs.map((leg, legIndex) => (
                  <div key={legIndex}>
                    <p><strong>Leg {legIndex + 1}:</strong></p>
                    <p><strong>Mode:</strong> {leg.mode}</p>
                    <p><strong>Bus Number / MRT Line:</strong> {leg.route || "N/A"}</p>
                    <p><strong>From:</strong> {leg.from.name}</p>
                    {leg.mode === "BUS" && (
                      <p><strong>Next Bus Arrival Time:</strong> {formatTime(leg.from.arrival)}</p>
                    )}
                    <p><strong>To:</strong> {leg.to.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Taxi Container */}
        {routesFetched && (
          <div className="taxi-container" style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: '#f0f0f0' }}>
            <br />
            <h1>Taxi</h1>
            {1 && (
              <div>
                {/*<p><strong>Nearest Taxi:</strong> {nearestTaxi}</p>*/}
                <p><strong>Duration:</strong> {taxiDuration}</p>
                <p><strong>Distance (km):</strong> {taxiDistance}</p>
                <p><strong>Fare:</strong> ${taxiFare}</p>
                <button onClick={() => handleAddTrip(null, "taxi")}>Select</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutePlanner;


