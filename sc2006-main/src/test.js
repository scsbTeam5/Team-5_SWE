
function findNearestTaxiToStartPoint(startCoordinates, taxiData) {
    const taxiCoordinates = taxiData.features.map(feature => ({
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0]
    }));

    // Calculate distances between start coordinates and each taxi
    const distances = taxiCoordinates.map(coordinate => calculateDistance(startCoordinates, coordinate));

    // Set a threshold distance (in kilometers)
    const thresholdDistance = 8;

    // Filter out taxis that are nearer to the start point
    const nearestTaxis = filterTaxisByDistance(taxiCoordinates, distances, thresholdDistance);

    //console.log("Taxis nearer to the start point:", nearestTaxis);

    // Return the nearest taxi coordinates
    return nearestTaxis;
}


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

function filterTaxisByDistance(taxiCoordinates, distances, thresholdDistance) {
    return taxiCoordinates.filter((coordinate, index) => distances[index] < thresholdDistance);
}


function fetchData(authorizationToken, cookie, startAddress, endAddress) {
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
    fetch(startUrl, requestOptions)
        .then((response) => response.json())
        .then((startResult) => {
            console.log("Start Address Data:", startResult);

            // Extract latitude and longitude of start point
            const startCoordinates = {
                latitude: parseFloat(startResult.results[0].LATITUDE),
                longitude: parseFloat(startResult.results[0].LONGITUDE)
            };

            // Fetch taxi availability data
            fetch("https://api.data.gov.sg/v1/transport/taxi-availability", requestOptions)
                .then((response) => response.json())
                .then((taxiData) => {
                    const nearestTaxi = findNearestTaxiToStartPoint(startCoordinates, taxiData);
                    console.log("Nearest taxi coordinates:", nearestTaxi);
                })
                .catch((error) => console.error("Error fetching taxi availability data:", error));
        })
        .catch((error) => console.error("Error fetching start address data:", error));
}

// Usage example:
const authorizationToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjMDhmOGUzOTBhZDg1ODk1OGYyODNjMDA5MGY4ZjQ0YiIsImlzcyI6Imh0dHA6Ly9pbnRlcm5hbC1hbGItb20tcHJkZXppdC1pdC0xMjIzNjk4OTkyLmFwLXNvdXRoZWFzdC0xLmVsYi5hbWF6b25hd3MuY29tL2FwaS92Mi91c2VyL3Bhc3N3b3JkIiwiaWF0IjoxNzEyMzcxNzQxLCJleHAiOjE3MTI2MzA5NDEsIm5iZiI6MTcxMjM3MTc0MSwianRpIjoicHNTdmRiR29hd2M0Z1dKYiIsInVzZXJfaWQiOjMxNjksImZvcmV2ZXIiOmZhbHNlfQ.qFw87gCw4QoY_jfg2w4iUISwH5hjxrXbZhm1c0z78-I";
const cookie = "_toffsuid=rB8E8GYL5xNLXUnGBoCUAg==";

let startAddress = "Jewel Changi Airport";
let endAddress = "Marina Bay Sands Skypark";

fetchData(authorizationToken, cookie, startAddress, endAddress);