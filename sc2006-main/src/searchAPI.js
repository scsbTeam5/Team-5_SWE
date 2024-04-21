//this takes in address as string[onemap], and passes in coordinates of start address to taxi api to
//compare against current available taxis[taxi api lta] return nearest taxi nearest to start
//address, and reverse geocodes back to string to return the place of current taxi[onemap], 
//also outputs 

// Usage example:
//const authorizationToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjMDhmOGUzOTBhZDg1ODk1OGYyODNjMDA5MGY4ZjQ0YiIsImlzcyI6Imh0dHA6Ly9pbnRlcm5hbC1hbGItb20tcHJkZXppdC1pdC0xMjIzNjk4OTkyLmFwLXNvdXRoZWFzdC0xLmVsYi5hbWF6b25hd3MuY29tL2FwaS92Mi91c2VyL3Bhc3N3b3JkIiwiaWF0IjoxNzEyMzcxNzQxLCJleHAiOjE3MTI2MzA5NDEsIm5iZiI6MTcxMjM3MTc0MSwianRpIjoicHNTdmRiR29hd2M0Z1dKYiIsInVzZXJfaWQiOjMxNjksImZvcmV2ZXIiOmZhbHNlfQ.qFw87gCw4QoY_jfg2w4iUISwH5hjxrXbZhm1c0z78-I";
//const cookie = "_toffsuid=rB8E8GYL5xNLXUnGBoCUAg==";


const axios = require('axios');
//const cookie = "_toffsuid=rB8E8GYL5xNLXUnGBoCUAg==";

//const data = {
 // email: "sassyrubiesvlog@gmail.com",
  //password: "3iWTHpRs@gR3fRJ"
//};
const cookie = "_toffsuid=rB8E8GYL5xNLXUnGBoCUAg==";
const data = {
 email: "YONG0257@e.ntu.edu.sg",
 password: "Sc2006sc2006"
};


let authorizationToken //= eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwY2YyM2M0ZDgzYzJmMjhkOTViNzIxODMxN2I3NmYzYSIsImlzcyI6Imh0dHA6Ly9pbnRlcm5hbC1hbGItb20tcHJkZXppdC1pdC0xMjIzNjk4OTkyLmFwLXNvdXRoZWFzdC0xLmVsYi5hbWF6b25hd3MuY29tL2FwaS92Mi91c2VyL3Bhc3N3b3JkIiwiaWF0IjoxNzEzMDEwMzE1LCJleHAiOjE3MTMyNjk1MTUsIm5iZiI6MTcxMzAxMDMxNSwianRpIjoiMzhKMnlTSm5oa0VBbTZoRSIsInVzZXJfaWQiOjMyNDIsImZvcmV2ZXIiOmZhbHNlfQ.W5m2vot6YMz0AEiDA8VnqDGm39SBhCwuGt93ErSDzY0; // Declare the variable to store the token

//authorizationToken=
//eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwY2YyM2M0ZDgzYzJmMjhkOTViNzIxODMxN2I3NmYzYSIsImlzcyI6Imh0dHA6Ly9pbnRlcm5hbC1hbGItb20tcHJkZXppdC1pdC0xMjIzNjk4OTkyLmFwLXNvdXRoZWFzdC0xLmVsYi5hbWF6b25hd3MuY29tL2FwaS92Mi91c2VyL3Bhc3N3b3JkIiwiaWF0IjoxNzEzMDEwMzE1LCJleHAiOjE3MTMyNjk1MTUsIm5iZiI6MTcxMzAxMDMxNSwianRpIjoiMzhKMnlTSm5oa0VBbTZoRSIsInVzZXJfaWQiOjMyNDIsImZvcmV2ZXIiOmZhbHNlfQ.W5m2vot6YMz0AEiDA8VnqDGm39SBhCwuGt93ErSDzY0
axios.post('https://www.onemap.gov.sg/api/auth/post/getToken', data)
  .then(response => {
     //Extract the token from the response data
    authorizationToken = response.data.access_token;
    //console.log('Authorization Token:', authorizationToken); // Log the token
  })
  .catch(error => {
     //Handle error here
   console.error('Error:', error);
  });


//////////////////////////////////////////////////////////////////////////////////////////////////////////
function findNearestTaxi(startCoordinates, taxiData) {
    const taxiCoordinates = taxiData.value.map(taxi => ({
        latitude: taxi.Latitude,
        longitude: taxi.Longitude
    }));

    // calculate distances between start coordinates and each taxi
    const distances = taxiCoordinates.map(coordinate => calculateDistance(startCoordinates, coordinate));

    // find the index of the nearest taxi
    const nearestTaxiIndex = distances.indexOf(Math.min(...distances));

    // return the nearest taxi's coordinates
    return taxiCoordinates[nearestTaxiIndex];
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const myHeaders = new Headers();
    myHeaders.append("Authorization", authorizationToken);
    myHeaders.append("Cookie", cookie);

const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
};

function fetchTaxiName(taxiCoordinates, requestOptions) {

    const location = `${taxiCoordinates.latitude},${taxiCoordinates.longitude}`;
    //console.log("Location:", location); // Log the location before making the request
    const url = `https://www.onemap.gov.sg/api/public/revgeocode?location=${location}&buffer=50`;
    //console.log("URL:", url); // Log the URL before making the request

    requestOptions.headers.set("Authorization", `Bearer ${authorizationToken}`);


    fetch(url, requestOptions)
        .then((response) => response.json())
        .then((result) => {
            console.log("OneMap API Response:", result.GeocodeInfo[0]); // Log out only 1st response
            
            if (result.GeocodeInfo && result.GeocodeInfo.length > 0) {
                const addressInfo = result.GeocodeInfo[0];
                const buildingName = addressInfo.BUILDINGNAME || "N/A";
                const block = addressInfo.BLOCK || "N/A";
                const road = addressInfo.ROAD || "N/A";
                
                console.log("Nearest taxi address components:");
                console.log("Building Name:", buildingName);
                console.log("Block:", block);
                console.log("Road:", road);
            } else {
                console.log("No address information available for the nearest taxi.");
            }
        })
        .catch((error) => console.error("Error fetching taxi name:", error));
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function fetchData(authorizationToken, cookie, startAddress, endAddress, routeType, date, time){
    let startCoordinates, endCoordinates; // Declare variables outside fetchData function

    const myHeaders = new Headers();
    myHeaders.append("Authorization", authorizationToken);
    myHeaders.append("Cookie", cookie);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    // Construct URLs for start and end address search
    const startUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(startAddress)}&returnGeom=Y&getAddrDetails=Y`;
    const endUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(endAddress)}&returnGeom=Y&getAddrDetails=Y`;

    // Fetch start address data
    const startDataPromise = fetch(startUrl, requestOptions)
        .then((response) => response.json())
        .then((startResult) => {
            console.log("Start Address Data:", startResult.results[0]);

        // extract latitude and longitude of start point
        startCoordinates = {
            latitude: parseFloat(startResult.results[0].LATITUDE),
            longitude: parseFloat(startResult.results[0].LONGITUDE)
        };
        console.log("start coordinates:", startCoordinates);
        return startCoordinates; // Return the coordinates for chaining promises
        })
        .catch((error) => console.error("Error fetching start address data:", error));


    startDataPromise.then((startCoordinates) => {

        fetchTaxiData(startCoordinates);
    });


    function fetchTaxiData(startCoordinates){
        const taxiHeaders = new Headers();
        taxiHeaders.append("AccountKey", "Q+WtW6O7Rp+w6O3VR9pCqQ==");

        const taxiRequestOptions = {
            method: "GET",
            headers: taxiHeaders,
            redirect: "follow"
         };

    return fetch("http://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability", taxiRequestOptions)
        .then((response) => {
            if (!response.ok){
                throw new Error('HTTP error! Status: ${response.status}');
            }
            return response.json();
        })
        .then((taxiData) => {
            if (taxiData){
                const nearestTaxi = findNearestTaxi(startCoordinates, taxiData);
                //console.log("Nearest taxi coordinates:", nearestTaxi);
                fetchTaxiName(nearestTaxi, requestOptions); // Call fetchTaxiName after finding nearest taxi
            }
            else {
                console.error("Error: Empty or incomplete response from server when fetching taxi availability data.");
            }
        })
        .catch((error) => console.error("Error fetching taxi availability data:", error));
    
    }
    

    //fetch end address data
    const endDataPromise = fetch(endUrl, requestOptions)
        .then((response) => response.json())
        .then((endResult) => {
             console.log("End Address Data:", endResult.results[0]);

             endCoordinates = {
                latitude: parseFloat(endResult.results[0].LATITUDE),
                longitude: parseFloat(endResult.results[0].LONGITUDE)
            };
            console.log("end coordinates:", endCoordinates);
            return endCoordinates;

        })
        .catch((error) => console.error("Error fetching end address data:", error));

    //wait for both promises to resolve 
    Promise.all ([startDataPromise,endDataPromise])
        .then(([startCoordinates, endCoordinates]) => {
            // Construct the URL for routing
            const routeUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${startCoordinates.latitude},${startCoordinates.longitude}&end=${endCoordinates.latitude},${endCoordinates.longitude}&routeType=${routeType}&date=${date}&time=${time}`;

            const routeHeaders = new Headers();
            routeHeaders.append("Authorization", authorizationToken);
            routeHeaders.append("Cookie", cookie);

            const routeRequestOptions = {
                method: "GET",
                headers: routeHeaders,
                redirect: "follow"
            };

            // Fetch route data
            // Fetch route data
            fetch(routeUrl, routeRequestOptions)
                .then(response => response.json())
                .then(result => {
                // Extract main route summary
                    console.log("Main Route Summary:", result.route_summary);
                    let mainRouteSummary = result.route_summary;
                    console.log("Main Route Summary:", mainRouteSummary);

                    // Initialize variables to store shortest distance and fastest time
                    let shortestDistance = mainRouteSummary.total_distance;
                    let fastestTime = mainRouteSummary.total_time;

                    // Initialize variables to store shortest route and fastest route
                    let shortestRoute = result;
                    let fastestRoute = result;

                    // Check if alternative routes exist
                    if (result.alternativeroute && result.alternativeroute.length > 0) {
                        // Iterate through alternative routes
                        result.alternativeroute.forEach(route => {
                            const routeSummary = route.route_summary;
                            const totalDistance = routeSummary.total_distance;
                            const totalTime = routeSummary.total_time;

                            // Check if the current alternative route has shorter distance
                            if (totalDistance < shortestDistance) {
                                shortestDistance = totalDistance;
                                shortestRoute = route;
                            }

                            // Check if the current alternative route has faster time
                            if (totalTime < fastestTime) {
                                fastestTime = totalTime;
                                fastestRoute = route;
                            }
                        });
                    }
                    
                    // Set the main route as the shortest and fastest route if no alternative routes exist
                    if (!shortestRoute) {
                        shortestRoute = result;
                    }
                    if (!fastestRoute) {
                        fastestRoute = result;
                    }

                    // Display shortest route
                    console.log("Shortest Route:");
                    console.log("Route Name:", shortestRoute.route_name);
                    console.log("Route Summary:", shortestRoute.route_summary);
                    console.log("Via Route:", shortestRoute.viaRoute);
                    console.log("Subtitle:", shortestRoute.subtitle);

                    // Display fastest route
                    console.log("Fastest Route:");
                    console.log("Route Name:", fastestRoute.route_name);
                    console.log("Route Summary:", fastestRoute.route_summary);
                    console.log("Via Route:", fastestRoute.viaRoute);
                    console.log("Subtitle:", fastestRoute.subtitle);
                    
    
                    const distance_km = shortestRoute.route_summary.total_distance/1000 ;

                    // Calculate taxi fare
                    const isHoliday = isPublicHoliday(date);
                    const fare = calculateTaxiFare(distance_km, time, isHoliday);
                    console.log('Total Fare:', '$' + fare.toFixed(2)); // Output the total fare rounded to 2 decimal places


            })
            .catch(error => console.error(error));
        })
        .catch(error => console.error(error));
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// let startAddress = "National Junior College";
// let endAddress = "NTU";
// const routeType = "drive";
// const date = "04-07-2024";
// const time = "110200";
//fetchData(authorizationToken, cookie, startAddress, endAddress);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter start address: ', (startAddress) => {
    rl.question('Enter end address: ', (endAddress) => {
        rl.question('Enter date (MM-DD-YYYY): ', (date) => {
            rl.question('Enter time (HHMMSS): ', (time) => {
                const routeType = "drive";
                fetchData(authorizationToken, cookie, startAddress, endAddress, routeType, date, time);
                rl.close();
            });
        });
    });
});


