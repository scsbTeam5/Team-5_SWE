import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './index.css';
import PromptLocationPermission from './promptLocationPermission.js';

const RoutePlanner = () => {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  //const [date, setDate] = useState('');
  //const [time, setTime] = useState('');
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [filterOption, setFilterOption] = useState('fastest'); // Default filter option
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [startCoordinates, setStartCoordinates] = useState(null); // Declare startCoordinates state
  const [endCoordinates, setEndCoordinates] = useState(null); // Declare startCoordinates state
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [cookie, setCookie] = useState('');
  const [currentAddress, setCurrentAddress] = useState(null); // State for building name
  const [showRoutes, setShowRoutes] = useState(false); // State to control route box visibility
  //const [mapMarkerUrl, setMapMarkerUrl] = useState(''); // URL for map with marker
  //const [shortestRouteData, setShortestRouteData] = useState(null);
  //const [fastestRouteData, setFastestRouteData] = useState(null);



  //const currentDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore', month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  //const currentTime = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '');

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


  const handleFetchRoutes = () => {

    // // prompt user for confirmation
    // const confirmFetch = window.confirm("Do you want to fetch the routes based on the provided addresses?");
    // //if user confirm
    // if(confirmFetch){

    // }
    axios.post('https://www.onemap.gov.sg/api/auth/post/getToken', {
      email: "YONG0257@e.ntu.edu.sg",
      password: "Sc2006sc2006"
    })
    .then(response => {
      const authorizationToken = response.data.access_token;
      
      fetchPTData(authorizationToken, startAddress, endAddress);

    })
    .catch(error => {
      console.error('Error fetching authorization token:', error);
    });
  };
  //FetchPTData

  
  const fetchPTData = (authorizationToken, startAddress, endAddress) => {
    const requestOptions = {
      headers: {
        Authorization: authorizationToken,
        Cookie: "_toffsuid=rB8E8GYL5xNLXUnGBoCUAg=="
      }
    };

    const startUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(startAddress)}&returnGeom=Y&getAddrDetails=Y`;
    const endUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(endAddress)}&returnGeom=Y&getAddrDetails=Y`;

    const startDataPromise = axios.get(startUrl, requestOptions);
    const endDataPromise = axios.get(endUrl, requestOptions);

    Promise.all([startDataPromise, endDataPromise])
// Inside the Promise.all block of fetchPTData function
.then(([startResponse, endResponse]) => {
  const startResult = startResponse.data.results[0];
  const endResult = endResponse.data.results[0];

  // Extract postal codes from start and end results
  const startPostal = parseInt(startResult.POSTAL);
  const endPostal = parseInt(endResult.POSTAL);

  // Set start and end coordinates
  const startCoordinates = {
    latitude: parseFloat(startResult.LATITUDE),
    longitude: parseFloat(startResult.LONGITUDE),
    postal: startPostal
  };
  const endCoordinates = {
    latitude: parseFloat(endResult.LATITUDE),
    longitude: parseFloat(endResult.LONGITUDE),
    postal: endPostal
  };
  
  // Update state with coordinates
  setStartCoordinates(startCoordinates);
  setEndCoordinates(endCoordinates);

   // Fetch taxi data
  const taxiPromise = fetchTaxiData(startCoordinates);
  
  const routeUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${startCoordinates.latitude},${startCoordinates.longitude}&end=${endCoordinates.latitude},${endCoordinates.longitude}&routeType=pt&date=08-08-2024&time=100000&mode=TRANSIT&numItineraries=2`;
  const ptRoutePromise = axios.get(routeUrl, requestOptions);

  return Promise.all([taxiPromise, ptRoutePromise]);

})

      .then(([taxiData,routeResponse]) => {
        //Taxi data

        //console.log("nearest taxi:",taxiData)
        const result = routeResponse.data;

        if (result.plan && result.plan.itineraries) {
          // Sorting itineraries based on duration (fastest route first)
          result.plan.itineraries.sort((a, b) => a.duration - b.duration);

          // Sorting itineraries based on fare (cheapest route first)
          result.plan.itineraries.sort((a, b) => a.fare - b.fare);

          setRoutes(result.plan.itineraries);
        } else {
          console.log("No itineraries found.");
          setRoutes([]);
        }
      })
      .catch(error => {
        console.error('Error fetching routes:', error);
      });
  };

};

  //////////////////////////////////////////////////////////////////////////
  // const handleFilterChange = (e) => {
  //   setFilterOption(e.target.value);
  // };

  const filterRoutes = () => {
    if (filterOption === 'fastest') {
      // Sort routes by duration in ascending order
      const sortedRoutes = [...routes].sort((a, b) => a.duration - b.duration);
      setFilteredRoutes(sortedRoutes);
    } else if (filterOption === 'cheapest') {
      // Sort routes by fare in ascending order
      const sortedRoutes = [...routes].sort((a, b) => a.fare - b.fare);
      setFilteredRoutes(sortedRoutes);
    }
  };
  
  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);

    // Check if the filter option is for taxi or public transport
    if (e.target.value === 'fastest') {
            const sortedRoutes = [...routes].sort((a, b) => a.duration - b.duration);
            setFilteredRoutes(sortedRoutes);
        } else if (e.target.value === 'cheapest') {
            const sortedRoutes = [...routes].sort((a, b) => a.fare - b.fare);
            setFilteredRoutes(sortedRoutes);
        }
    }

  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0'); // Zero-padded hours
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Zero-padded minutes
    const seconds = date.getSeconds().toString().padStart(2, '0'); // Zero-padded seconds
    return `${hours}:${minutes}:${seconds}`; // Return the formatted time
  };

  ////////////////////////////////////////////////////////////////////////////////////
  const fetchTaxiData = (startCoordinates, endCoordinates, authorizationToken) => {
    // Fetch route data
    return fetchRouteData(startCoordinates, endCoordinates, 'drive', '100000', authorizationToken)
        .then(routeData => {
            // Calculate distance and time based on filterOption
            let distance_km, duration;

            // Fetch taxi data
            const taxiHeaders = new Headers();
            taxiHeaders.append("AccountKey", "Q+WtW6O7Rp+w6O3VR9pCqQ==");

            const taxiRequestOptions = {
                method: "GET",
                headers: taxiHeaders,
                redirect: "follow"
            };

            return fetch("http://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability", taxiRequestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('HTTP error! Status: ${response.status}');
                    }
                    return response.json();
                })
                .then(taxiData => {
                    if (taxiData) {
                        // Find nearest taxi address
                        const nearestTaxiAddress = findNearestTaxiAddress(startCoordinates, taxiData, taxiRequestOptions, authorizationToken);

                        // Calculate fare using distance and duration
                        const fare = calculateTaxiFare(distance_km, duration, isPublicHoliday("08-08-2024"));

                        // Return the relevant data
                        return {
                            nearestTaxiAddress,
                            distance_km,
                            duration,
                            fare
                        };
                    }
                })
                .catch(error => {
                    console.error('Error fetching taxi data:', error);
                    throw error; // Propagate the error
                });
        })
        .catch(error => {
            console.error('Error fetching route data:', error);
            throw error; // Propagate the error
        });
};




/////////////////////////////////////////////////////////////////////////////////////////
function findNearestTaxiAddress(startCoordinates, taxiData,taxiRequestOptions,authorizationToken) {
  const taxiCoordinates = taxiData.value.map(taxi => ({
      latitude: taxi.Latitude,
      longitude: taxi.Longitude
  }));

  // calculate distances between start coordinates and each taxi
  const distances = taxiCoordinates.map(coordinate => calculateDistance(startCoordinates, coordinate));
  // find the index of the nearest taxi
  const nearestTaxiIndex = distances.indexOf(Math.min(...distances));

  // return the nearest taxi's coordinates
  const nearestTaxi = taxiCoordinates[nearestTaxiIndex];

  //comverting the coordinates to string form to get taxi name 
  const location = `${nearestTaxi.latitude},${nearestTaxi.longitude}`;
  const url = `https://www.onemap.gov.sg/api/public/revgeocode?location=${location}&buffer=50`;

  taxiRequestOptions.headers.set("Authorization", `Bearer ${authorizationToken}`);

  return fetch(url, taxiRequestOptions)
      .then(response => response.json())
      .then(result => {
          if (result.GeocodeInfo && result.GeocodeInfo.length > 0) {
              const addressInfo = result.GeocodeInfo[0];
              const buildingName = addressInfo.BUILDINGNAME || "N/A";
              const block = addressInfo.BLOCK || "N/A";
              const road = addressInfo.ROAD || "N/A";

              const nearestTaxiAddress = {
                  buildingName,
                  block,
                  road
              };

              return nearestTaxiAddress;
          } else {
              console.log("No address information available for the nearest taxi.");
              return null;
          }
      })
      .catch(error => {
          console.error("Error fetching taxi name:", error);
          return null;
      });
};
/////////////////////////////////////////////////////////////////////////////////////////
const fetchRouteData = (startCoordinates, endCoordinates, routeType, date, authorizationToken) => {
  const routeUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${startCoordinates.latitude},${startCoordinates.longitude}&end=${endCoordinates.latitude},${endCoordinates.longitude}&routeType=${routeType}&date=${date}&time=08-08-2024`;

  const routeHeaders = new Headers();
  routeHeaders.append("Authorization", authorizationToken);
  routeHeaders.append("Cookie", "_toffsuid=rB8E8GYadhQiED8MBsoLAg==");

  const routeRequestOptions = {
      method: "GET",
      headers: routeHeaders,
      redirect: "follow"
  };

  return fetch(routeUrl, routeRequestOptions)
      .then(response => response.json())
      .then(result => {
        const { total_time, total_distance } = result.route_summary; // Extract time and distance
        return { totalTime: total_time, totalDistance: total_distance };
      });
  };

///////////////////////////////////////////////////////////////////////////////////////////

const publicHolidays = [
  '01-01-2024',   //new year's
  '02-10-2024',   //cny
  '02-11-2024',   //cny
  '02-12-2024',   //cny
  '03-29-2024',   //good fri
  '04-10-2024',   //hari raya puasa
  '05-01-2024',   //labour day 
  '05-22-2024',   //vesak day
  '06-17-2024',   //hari raya haji
  '08-09-2024',   //national day
  '10-31-2024',   //deepavali
  '12-25-2024',   //christmas 
];

//check if date is public holiday 
function isPublicHoliday(date){
  // Check if the dateString exists in the publicHolidays array
  return publicHolidays.includes(date);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////
function calculateTaxiFare(distance, time, isPublicHoliday) {
  // Define base fare and distance-based unit fare
  const baseFare = 4.50;
  let distanceUnitFare = 0;

  // Check if the distance is within the range of 1km to 10km
  if (distance <= 10) {
      // Calculate fare for every 400 meters within the range
      distanceUnitFare = Math.ceil(distance * 1000 / 400) * 0.25; // 25 cents every 400m
  } else {
      // Calculate fare for the first 10km
      distanceUnitFare = Math.ceil(10 * 1000 / 400) * 0.25; // 25 cents every 400m

      // Calculate fare for the distance beyond 10km
      distanceUnitFare += Math.ceil((distance - 10) * 1000 / 350) * 0.25; // 25 cents every 350m
  }


  // Calculate distance-based fare
  //const distanceFare = distance * distanceUnitFare;

  // Check for peak periods, weekends, and late-night hiring
  let fareMultiplier = 1; // Default multiplier
  const hour = parseInt(time.slice(0,2)); // Extract hour from the time string

  // Peak periods
  if ((hour >= 6 && hour < 9 && !isPublicHoliday) || (hour >= 17 && isPublicHoliday)) {
      fareMultiplier += 0.25;
  }

  // Weekends
  if ((hour >= 10 && hour < 14) || (hour >= 17 && isPublicHoliday)) {
      fareMultiplier += 0.25;
  }

  // Late Night Hiring
  if (hour >= 0 && hour < 6) {
      fareMultiplier += 0.5;
  }

  // Calculate total fare
  const totalFare = (baseFare + distanceUnitFare) * fareMultiplier;

  return totalFare;
}
/////////////////////////////////////////////////////////////////////////////////////////
function calculateDistance(coords1, coords2) {
  const earthRadiusKm = 6371;
  const lat1 = degreesToRadians(coords1.latitude);
  const lat2 = degreesToRadians(coords2.latitude);
  const long1 = degreesToRadians(coords1.longitude); // Convert longitude of coords1 to radians
  const long2 = degreesToRadians(coords2.longitude); // Convert longitude of coords2 to radians

  const deltaLat = degreesToRadians(coords2.latitude - coords1.latitude);
  const deltaLng = degreesToRadians(coords2.longitude - coords1.longitude);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusKm * c;

  return distance;
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

//////////////////////////////////////////////////////////////////////////////////////////
  return (
  <div className="route-planner">
    <PromptLocationPermission setLocation={setLocation} />
    {location && <p>Current Location: {currentAddress}</p>}

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
          <label htmlFor="startAddress">Start Address</label>
          <input
            id="startAddress"
            type="text"
            placeholder="Start Address"
            value={currentAddress}
            onChange={(e) => setStartAddress(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor='endAddress'>End Destination</label>
          <input
            type="text"
            placeholder="End Address"
            value={endAddress}
            onChange={(e) => setEndAddress(e.target.value)}
          />
        </div>
        <button onClick={handleFetchRoutes} style={{ margin: '10px auto', display: 'block' }}>
          Get routes
        </button>
      </div>

      {/* Filter options */}
      <div className="filter-options">
        <label>
          <input
            type="radio"
            value="fastest"
            checked={filterOption === 'fastest'}
            onChange={handleFilterChange}
          />
          Fastest Route
        </label>
        <br />
        <label>
          <input
            type="radio"
            value="cheapest"
            checked={filterOption === 'cheapest'}
            onChange={handleFilterChange}
          />
          Cheapest Route
        </label>
      </div>
    </div>
  
    {/* Container for Routes and Taxi */}
    <div className="routes-and-taxi-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
      {/* Routes Container */}
      <div className="routes" style={{ flex: '1', marginRight: '10px', borderRadius: '10px', backgroundColor: '#f0f0f0', padding: '10px' }}>
        {filteredRoutes.map((route, index) => (
          <div key={index} className="itinerary">
            <h1>Transit</h1>
            {/* Display route details */}
            <p><strong>Route {index + 1}</strong></p>
            <p><strong>Duration (minutes):</strong> {Math.round(route.duration / 60)}</p>
            <p><strong>Fare:</strong> ${route.fare}</p>
            {/* ADD THE FUNCTION TO SUBMIT DATA INTO FIREBASE HERE */}
            <button>Select</button>
            <hr/>
            {/* Display legs information */}
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
                  <hr/> {/*add spacing */}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Taxi Container */}
      <div className="TaxiRoute" style={{ flex: '1', marginRight: '10px',borderRadius: '10px', backgroundColor: '#f0f0f0', padding: '10px' }}>
        {/* Render TaxiContainer component */}
        <h2>Taxi</h2>
        {fetchTaxiData && (
          <div>
            <p><strong>Nearest Taxi Address:</strong> {fetchTaxiData.nearestTaxiAddress}</p>
            <p><strong>Distance (km):</strong> {fetchTaxiData.distance_km}</p>
            <p><strong>Duration:</strong> {fetchTaxiData.duration} minutes</p>
            <p><strong>Fare:</strong> ${fetchTaxiData.fare}</p>
        </div>
        )}
      </div>
    </div>
  </div>
  );


};

export default RoutePlanner;

