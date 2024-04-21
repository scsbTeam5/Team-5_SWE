import React, { useEffect } from 'react';

function LocationComponent({ setLocation }) {
    useEffect(() => {
        if (!navigator.geolocation) {
            console.log("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
            },
            () => {
                console.log("Error retrieving location.");
            }
        );
    }, [setLocation]); // Include setLocation in the dependency array to ensure stability

    return null;  // This component doesn't need to render anything itself
}

export default LocationComponent;
