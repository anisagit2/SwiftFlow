import {
    buildDirectionsRendererOptions,
    buildMapFallbackMarkup,
    buildMapOptions,
    buildWalkingRouteRequest,
    getDriverForMap,
    getMapRoutePoints,
    pickShortestRoute,
} from "./googleMapsHelpers.js";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
const GOOGLE_MAPS_SCRIPT_ID = "swiftflow-google-maps-js";

let googleMapsPromise;

const renderMapFallback = (element, message) => {
    element.dataset.googleMapReady = "fallback";
    element.classList.add("google-map--fallback");
    element.innerHTML = buildMapFallbackMarkup(message);
};

const setMapStatus = (element, message) => {
    const status = element.querySelector("[data-map-status]");
    if (status) {
        status.textContent = message;
    }
};

const loadGoogleMaps = () => {
    if (!GOOGLE_MAPS_API_KEY) {
        return Promise.resolve(null);
    }

    if (window.google?.maps?.places) {
        return Promise.resolve(window.google);
    }

    if (googleMapsPromise) {
        return googleMapsPromise;
    }

    googleMapsPromise = new Promise((resolve, reject) => {
        window.gm_authFailure = () => {
            reject(new Error("Google Maps authorization failed. Check the API key, allowed referrers, and billing."));
        };

        const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(window.google));
            existingScript.addEventListener("error", reject);
            return;
        }

        const script = document.createElement("script");
        script.id = GOOGLE_MAPS_SCRIPT_ID;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.addEventListener("load", () => resolve(window.google));
        script.addEventListener("error", () => reject(new Error("Unable to load Google Maps.")));
        document.head.appendChild(script);
    });

    return googleMapsPromise;
};

const initializePlaceAutocomplete = (google, root, onPlaceSelected) => {
    root.querySelectorAll("[data-place-autocomplete]").forEach((input) => {
        if (input.dataset.googleAutocompleteReady === "true") {
            return;
        }

        const autocomplete = new google.maps.places.Autocomplete(input, {
            componentRestrictions: { country: ["my", "sg"] },
            fields: ["formatted_address", "geometry", "name", "place_id"],
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const value = place.formatted_address || place.name || input.value;
            input.value = value;
            onPlaceSelected(input.dataset.field, value);
        });

        input.dataset.googleAutocompleteReady = "true";
    });
};

const initializeCarpoolMap = (google, root, state, onRouteEstimated) => {
    const mapElement = root.querySelector("[data-google-map='carpool-pickup']");
    if (!mapElement || mapElement.dataset.googleMapReady === "true") {
        return;
    }

    const driver = getDriverForMap(state);
    const { originCoordinates, destinationCoordinates } = getMapRoutePoints(state, driver);

    const map = new google.maps.Map(
        mapElement,
        buildMapOptions(destinationCoordinates ?? originCoordinates ?? { lat: 1.462, lng: 103.764 }),
    );
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer(buildDirectionsRendererOptions(map));

    directionsService.route(buildWalkingRouteRequest(
        google,
        originCoordinates ?? state.booking.origin,
        destinationCoordinates ?? driver.pickupSpot,
    ), (result, status) => {
        if (status !== "OK" || !result) {
            renderMapFallback(mapElement, "Google Maps loaded, but the walking route estimate is unavailable for this pickup point right now.");
            return;
        }

        const shortestRoute = pickShortestRoute(result.routes);

        directionsRenderer.setDirections({
            ...result,
            routes: shortestRoute ? [shortestRoute] : result.routes,
        });

        const leg = shortestRoute?.legs?.[0] ?? result.routes?.[0]?.legs?.[0];
        if (leg?.duration?.text) {
            onRouteEstimated(driver.id, leg.duration.text);
            setMapStatus(mapElement, `Walking route: ${leg.duration.text}`);
        } else {
            setMapStatus(mapElement, "Interactive pickup map loaded.");
        }
    });

    window.setTimeout(() => {
        if (mapElement.querySelector(".gm-err-container")) {
            renderMapFallback(
                mapElement,
                "Google Maps could not render correctly for this project. Check your Maps JavaScript API key, billing, and website restrictions.",
            );
        }
    }, 1200);

    mapElement.dataset.googleMapReady = "true";
};

export const initializeGoogleMapsFeatures = (root, state, callbacks) => {
    const mapElements = root.querySelectorAll("[data-google-map]");
    if (!GOOGLE_MAPS_API_KEY) {
        mapElements.forEach((element) => {
            renderMapFallback(element, "Add VITE_GOOGLE_MAPS_API_KEY to enable the interactive Google map.");
        });
        return;
    }

    loadGoogleMaps()
        .then((google) => {
            if (!google) {
                return;
            }

            initializePlaceAutocomplete(google, root, callbacks.onPlaceSelected);
            initializeCarpoolMap(google, root, state, callbacks.onRouteEstimated);
        })
        .catch(() => {
            mapElements.forEach((element) => {
                renderMapFallback(element, "Google Maps could not load. Showing the fallback pickup card instead.");
            });
        });
};
