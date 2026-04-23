const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";
let authTokenGetter = null;

const sleep = (ms) => new Promise((resolve) => {
    window.setTimeout(resolve, ms);
});

const isNetworkError = (error) => error instanceof TypeError;

const mapRequestError = (error) => {
    if (isNetworkError(error)) {
        return new Error(
            "SwiftFlow could not reach the backend yet. This is usually a short Cloud Run cold start or a network/CORS issue. Please retry in a moment.",
        );
    }

    return error instanceof Error ? error : new Error("Request failed.");
};

const request = async (path, options = {}) => {
    const attempts = options.method && options.method !== "GET" ? 1 : 3;
    let lastError = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const token = authTokenGetter ? await authTokenGetter() : null;
            const response = await fetch(`${API_BASE_URL}${path}`, {
                headers: {
                    "Content-Type": "application/json",
                    "X-SwiftFlow-Language": navigator.language ?? "en",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...(options.headers ?? {}),
                },
                ...options,
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload.message ?? "Request failed.");
            }

            return payload;
        } catch (error) {
            lastError = error;

            if (!isNetworkError(error) || attempt === attempts) {
                break;
            }

            await sleep(attempt * 700);
        }
    }

    throw mapRequestError(lastError);
};

export const apiClient = {
    setAuthTokenGetter: (getter) => {
        authTokenGetter = getter;
    },
    getState: () => request("/api/state"),
    resetState: () => request("/api/state/reset", { method: "POST" }),
    updateTrainBooking: (payload) => request("/api/bookings/train", { method: "PATCH", body: JSON.stringify(payload) }),
    confirmTrainBooking: () => request("/api/bookings/train/confirm", { method: "POST" }),
    updateBusBooking: (payload) => request("/api/bookings/bus", { method: "PATCH", body: JSON.stringify(payload) }),
    confirmBusBooking: () => request("/api/bookings/bus/confirm", { method: "POST" }),
    selectCarpoolDriver: (driverId) => request("/api/bookings/carpool/select-driver", { method: "PATCH", body: JSON.stringify({ driverId }) }),
    updateCarpoolPayment: (paymentMethod) => request("/api/bookings/carpool/payment", { method: "PATCH", body: JSON.stringify({ paymentMethod }) }),
    confirmCarpoolBooking: () => request("/api/bookings/carpool/confirm", { method: "POST" }),
    acceptCheckIn: () => request("/api/check-in", { method: "POST" }),
    acceptAlert: () => request("/api/alerts/accept", { method: "POST" }),
    redeemReward: (rewardId) => request(`/api/rewards/${rewardId}/redeem`, { method: "POST" }),
    updateProfile: (payload) => request("/api/profile", { method: "PATCH", body: JSON.stringify(payload) }),
};
