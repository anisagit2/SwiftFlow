const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

const request = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
        ...options,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.message ?? "Request failed.");
    }

    return payload;
};

export const apiClient = {
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
};
