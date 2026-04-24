export const LOCATION_COORDINATES = {
    "Bukit Chagar, Johor": { lat: 1.46238, lng: 103.76402 },
    "Komtar JBCC pickup bay A": { lat: 1.46205, lng: 103.76353 },
    "Bukit Chagar shared ride point": { lat: 1.46174, lng: 103.76436 },
    "CIQ South carpool gate": { lat: 1.46129, lng: 103.76279 },
};

export const buildMapFallbackMarkup = (message) => `
    <div class="map-fallback-card">
        <div class="map-fallback-badge">
            <span class="material-symbols-outlined">map</span>
            <span>Pickup map</span>
        </div>
        <h3>Interactive map unavailable</h3>
        <p>${message}</p>
        <div class="map-fallback-points">
            <div class="map-fallback-point">
                <span class="material-symbols-outlined filled">place</span>
                <div>
                    <strong>Use the pickup route card below</strong>
                    <span>It still shows the meeting point, walk ETA, and departure time.</span>
                </div>
            </div>
            <div class="map-fallback-point">
                <span class="material-symbols-outlined filled">directions_walk</span>
                <div>
                    <strong>Map will appear automatically once Google Maps is configured</strong>
                    <span>No extra tap is needed after the API key and billing are working.</span>
                </div>
            </div>
        </div>
    </div>
`;

export const getDriverForMap = (state) =>
    state.carpoolDrivers.find((item) => item.id === state.selectedCarpoolDriverId) ?? state.carpoolDrivers[0];

export const getMapRoutePoints = (state, driver) => ({
    originCoordinates: LOCATION_COORDINATES[state.booking.origin],
    destinationCoordinates: LOCATION_COORDINATES[driver.pickupSpot],
});

export const buildMapOptions = (center) => ({
    center,
    disableDefaultUI: false,
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 17,
});

export const buildDirectionsRendererOptions = (map) => ({
    map,
    suppressMarkers: false,
    polylineOptions: {
        strokeColor: "#006c46",
        strokeOpacity: 0.9,
        strokeWeight: 5,
    },
});

export const buildWalkingRouteRequest = (google, origin, destination) => ({
    origin,
    destination,
    travelMode: google.maps.TravelMode.WALKING,
    provideRouteAlternatives: true,
});

export const pickShortestRoute = (routes = []) => [...routes].sort((left, right) => {
    const leftDistance = left.legs?.[0]?.distance?.value ?? Number.MAX_SAFE_INTEGER;
    const rightDistance = right.legs?.[0]?.distance?.value ?? Number.MAX_SAFE_INTEGER;
    return leftDistance - rightDistance;
})[0];
