import { selectedCarpoolDriver } from "./selectors.js";
import { syncDerivedTimes } from "../utils/time.js";

export const setActiveTab = (state, tab) => {
    state.activeTab = tab;
};

export const activateCheckIn = (state) => {
    if (!state.checkInAccepted) {
        state.checkInAccepted = true;
        state.passReady = true;
        state.balance += 120;
        state.recentCredits.unshift({
            title: "Priority QR Check-In",
            detail: "Accepted low-volume border window",
            amount: 120,
            time: "Just now",
            icon: "qr_code_2",
        });
    }

    state.activeTab = "booking";
};

export const acceptAlert = (state) => {
    state.alertAccepted = true;
    state.checkInAccepted = true;
    state.passReady = true;
    state.routeMode = "RTS Link";
    state.routeGate = "North Bridge RTS Transfer";
    state.routeWindow = "10:15 - 10:45";
    state.balance += 80;
    state.activeTab = "explore";
};

export const openPass = (state) => {
    state.activeTab = "profile";
};

export const redeemReward = (state, rewardId) => {
    const reward = state.rewards.find((item) => item.id === rewardId);

    if (!reward || state.balance < reward.cost) {
        return;
    }

    state.balance -= reward.cost;
    state.recentCredits.unshift({
        title: `Redeemed ${reward.name}`,
        detail: "Marketplace redemption completed",
        amount: -reward.cost,
        time: "Just now",
        icon: "redeem",
    });
    state.activeTab = "credits";
};

export const selectDriver = (state, driverId) => {
    state.selectedCarpoolDriverId = driverId;
};

export const updateDestination = (state, destination) => {
    state.booking.destination = destination;
    state.busBooking.destination = destination;
    state.routeGate = destination.includes("Woodlands") ? "Gate B22" : "Gate C14";
    state.routeWindow = `${state.booking.departureTime} - ${state.booking.arrivalTime}`;
};

export const updateOrigin = (state, origin) => {
    state.booking.origin = origin;
    state.busBooking.origin = origin;
};

export const updateBusOrigin = (state, origin) => {
    state.busBooking.origin = origin;
};

export const updateTrainTime = (state, time) => {
    state.booking.departureTime = time;
    syncDerivedTimes(state);
    state.routeWindow = `${state.booking.departureTime} - ${state.booking.arrivalTime}`;
};

export const updateBusTime = (state, time) => {
    state.busBooking.departureTime = time;
    syncDerivedTimes(state);
};

export const updateTrainPayment = (state, paymentMethod) => {
    state.booking.paymentMethod = paymentMethod;
};

export const updateBusPayment = (state, paymentMethod) => {
    state.busBooking.paymentMethod = paymentMethod;
};

export const updateCarpoolPayment = (state, paymentMethod) => {
    selectedCarpoolDriver(state).paymentMethod = paymentMethod;
};
