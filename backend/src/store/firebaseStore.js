import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createSeedState } from "../data/seedState.js";
import { syncDerivedTimes } from "../utils/time.js";

// Initialize Firebase Admin with Application Default Credentials
// The user should run `gcloud auth application-default login` locally.
try {
    initializeApp({
        credential: applicationDefault(),
        projectId: "personal-claw-1",
    });
} catch (error) {
    if (!/already exists/.test(error.message)) {
        console.error("Firebase initialization error", error.stack);
    }
}

const db = getFirestore();
const STATE_DOC_ID = "default_user";
const stateRef = db.collection("app_state").doc(STATE_DOC_ID);

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const selectedCarpoolDriver = (state) =>
    state.carpoolDrivers.find((driver) => driver.id === state.selectedCarpoolDriverId) ?? state.carpoolDrivers[0];

const ensureOption = (options, value, label) => {
    if (value === undefined) {
        return;
    }

    if (!options.includes(value)) {
        throw new Error(`${label} must be one of the configured options.`);
    }
};

const pushCreditActivity = (state, entry) => {
    state.recentCredits.unshift(entry);
};

const updateRouteWindow = (state) => {
    state.routeWindow = `${state.booking.departureTime} - ${state.booking.arrivalTime}`;
};

const buildConfirmationCode = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const decrementSeatsLabel = (seatsLabel) => {
    const match = seatsLabel.match(/(\d+)/);

    if (!match) {
        return seatsLabel;
    }

    const nextSeats = Math.max(0, Number(match[1]) - 1);
    return `${nextSeats} seat${nextSeats === 1 ? "" : "s"} left`;
};

const buildSnapshot = (state) => ({
    meta: {
        activeTab: state.activeTab,
        countdownSeconds: state.countdownSeconds,
        checkInAccepted: state.checkInAccepted,
        alertAccepted: state.alertAccepted,
        passReady: state.passReady,
    },
    explore: {
        booking: state.booking,
        busBooking: state.busBooking,
        selectedCarpoolDriver: selectedCarpoolDriver(state),
    },
    alerts: {
        accepted: state.alertAccepted,
        routeMode: state.routeMode,
        routeGate: state.routeGate,
        routeWindow: state.routeWindow,
    },
    bookings: {
        train: state.booking,
        bus: state.busBooking,
        carpool: {
            drivers: state.carpoolDrivers,
            selectedDriverId: state.selectedCarpoolDriverId,
            selectedDriver: selectedCarpoolDriver(state),
        },
    },
    credits: {
        balance: state.balance,
        rank: state.rank,
        ecoSaved: state.ecoSaved,
        goalCredits: state.goalCredits,
        recentCredits: state.recentCredits,
    },
    rewards: state.rewards,
    profile: {
        routeMode: state.routeMode,
        routeGate: state.routeGate,
        routeWindow: state.routeWindow,
        destination: state.booking.destination,
        departureTime: state.booking.departureTime,
        passReady: state.passReady,
    },
    options: {
        locations: state.locationOptions,
        trainTimes: state.trainTimeOptions,
        busTimes: state.busTimeOptions,
        trainPayments: state.trainPaymentOptions,
        busPayments: state.busPaymentOptions,
        carpoolPayments: state.carpoolPaymentOptions,
    },
});

export const createAppStore = () => {
    // Helper to get or seed the state
    const loadState = async () => {
        const doc = await stateRef.get();
        if (!doc.exists) {
            const initialState = createSeedState();
            syncDerivedTimes(initialState);
            updateRouteWindow(initialState);
            await stateRef.set(initialState);
            return initialState;
        }
        return doc.data();
    };

    const saveState = async (state) => {
        await stateRef.set(state);
    };

    return {
        async getState() {
            const state = await loadState();
            return deepClone(state);
        },

        async getSnapshot() {
            const state = await loadState();
            return deepClone(buildSnapshot(state));
        },

        async resetState() {
            const state = createSeedState();
            syncDerivedTimes(state);
            updateRouteWindow(state);
            await saveState(state);
            return deepClone(state);
        },

        async updateTrainBooking(input) {
            const state = await loadState();
            const { origin, destination, departureTime, paymentMethod } = input;

            ensureOption(state.locationOptions, origin, "origin");
            ensureOption(state.locationOptions, destination, "destination");
            ensureOption(state.trainTimeOptions, departureTime, "departureTime");
            ensureOption(state.trainPaymentOptions, paymentMethod, "paymentMethod");

            if (origin) {
                state.booking.origin = origin;
                state.busBooking.origin = origin;
            }

            if (destination) {
                state.booking.destination = destination;
                state.busBooking.destination = destination;
                state.routeGate = destination.includes("Woodlands") ? "Gate B22" : "Gate C14";
            }

            if (departureTime) {
                state.booking.departureTime = departureTime;
                syncDerivedTimes(state);
            }

            if (paymentMethod) {
                state.booking.paymentMethod = paymentMethod;
            }

            updateRouteWindow(state);
            await saveState(state);
            return deepClone(state.booking);
        },

        async updateBusBooking(input) {
            const state = await loadState();
            const { origin, destination, departureTime, paymentMethod } = input;

            ensureOption(state.locationOptions, origin, "origin");
            ensureOption(state.locationOptions, destination, "destination");
            ensureOption(state.busTimeOptions, departureTime, "departureTime");
            ensureOption(state.busPaymentOptions, paymentMethod, "paymentMethod");

            if (origin) {
                state.busBooking.origin = origin;
            }

            if (destination) {
                state.busBooking.destination = destination;
                state.booking.destination = destination;
            }

            if (departureTime) {
                state.busBooking.departureTime = departureTime;
                syncDerivedTimes(state);
            }

            if (paymentMethod) {
                state.busBooking.paymentMethod = paymentMethod;
            }

            updateRouteWindow(state);
            await saveState(state);
            return deepClone(state.busBooking);
        },

        async getCarpoolBooking() {
            const state = await loadState();
            return deepClone({
                drivers: state.carpoolDrivers,
                selectedDriverId: state.selectedCarpoolDriverId,
                selectedDriver: selectedCarpoolDriver(state),
                origin: state.booking.origin,
            });
        },

        async selectCarpoolDriver(driverId) {
            const state = await loadState();
            const driver = state.carpoolDrivers.find((item) => item.id === driverId);

            if (!driver) {
                throw new Error("driverId does not match an available carpool driver.");
            }

            state.selectedCarpoolDriverId = driverId;
            await saveState(state);
            return this.getCarpoolBooking();
        },

        async updateCarpoolPayment(paymentMethod) {
            const state = await loadState();
            ensureOption(state.carpoolPaymentOptions, paymentMethod, "paymentMethod");
            const driver = state.carpoolDrivers.find((d) => d.id === state.selectedCarpoolDriverId) ?? state.carpoolDrivers[0];
            driver.paymentMethod = paymentMethod;
            await saveState(state);
            return this.getCarpoolBooking();
        },

        async confirmTrainBooking() {
            const state = await loadState();
            if (!state.booking.confirmed) {
                state.booking.confirmed = true;
                state.booking.status = "RTS Confirmed";
                state.booking.paymentStatus = `Charged to ${state.booking.paymentMethod}`;
                state.booking.confirmationCode = buildConfirmationCode("RTS");
                state.passReady = true;
                state.routeMode = "RTS Link";
            }

            state.activeTab = "booking";
            updateRouteWindow(state);
            await saveState(state);
            return deepClone(state.booking);
        },

        async confirmBusBooking() {
            const state = await loadState();
            if (!state.busBooking.confirmed) {
                state.busBooking.confirmed = true;
                state.busBooking.status = "Bus Confirmed";
                state.busBooking.paymentStatus = `Charged to ${state.busBooking.paymentMethod}`;
                state.busBooking.confirmationCode = buildConfirmationCode("BUS");
                state.routeMode = state.busBooking.route;
            }

            state.activeTab = "bus-booking";
            await saveState(state);
            return deepClone(state.busBooking);
        },

        async confirmCarpoolBooking() {
            const state = await loadState();
            const driver = state.carpoolDrivers.find((d) => d.id === state.selectedCarpoolDriverId) ?? state.carpoolDrivers[0];

            if (!state.carpoolBooking.confirmed || state.carpoolBooking.driverId !== driver.id) {
                if (driver.reservationStatus !== "Reserved") {
                    driver.seats = decrementSeatsLabel(driver.seats);
                }

                driver.reservationStatus = "Reserved";
                state.carpoolBooking.confirmed = true;
                state.carpoolBooking.driverId = driver.id;
                state.carpoolBooking.status = "Carpool Reserved";
                state.carpoolBooking.paymentStatus = `Charge queued for ${driver.paymentMethod}`;
                state.carpoolBooking.confirmationCode = buildConfirmationCode("CAR");
                state.routeMode = "Taxi Carpool";
            }

            state.activeTab = "carpool-booking";
            await saveState(state);

            return deepClone({
                drivers: state.carpoolDrivers,
                selectedDriverId: state.selectedCarpoolDriverId,
                selectedDriver: driver,
                origin: state.booking.origin,
                booking: state.carpoolBooking,
            });
        },

        async activateCheckIn() {
            const state = await loadState();
            if (!state.checkInAccepted) {
                state.checkInAccepted = true;
                state.passReady = true;
                state.balance += 120;
                pushCreditActivity(state, {
                    title: "Priority QR Check-In",
                    detail: "Accepted low-volume border window",
                    amount: 120,
                    time: "Just now",
                    icon: "qr_code_2",
                });
            }

            state.activeTab = "booking";
            await saveState(state);
            return this.getSnapshot();
        },

        async acceptAlert() {
            const state = await loadState();
            state.alertAccepted = true;
            state.checkInAccepted = true;
            state.passReady = true;
            state.routeMode = "RTS Link";
            state.routeGate = "North Bridge RTS Transfer";
            state.routeWindow = "10:15 - 10:45";
            state.balance += 80;
            state.activeTab = "explore";
            
            await saveState(state);

            return deepClone({
                accepted: state.alertAccepted,
                routeMode: state.routeMode,
                routeGate: state.routeGate,
                routeWindow: state.routeWindow,
                balance: state.balance,
            });
        },

        async getCredits() {
            const state = await loadState();
            return deepClone(buildSnapshot(state).credits);
        },

        async getRewards() {
            const state = await loadState();
            return deepClone({
                rewards: state.rewards,
                balance: state.balance,
            });
        },

        async redeemReward(rewardId) {
            const state = await loadState();
            const reward = state.rewards.find((item) => item.id === rewardId);

            if (!reward) {
                throw new Error("rewardId does not match an available reward.");
            }

            if (state.balance < reward.cost) {
                throw new Error("Not enough credits to redeem this reward.");
            }

            state.balance -= reward.cost;
            pushCreditActivity(state, {
                title: `Redeemed ${reward.name}`,
                detail: "Marketplace redemption completed",
                amount: -reward.cost,
                time: "Just now",
                icon: "redeem",
            });
            state.activeTab = "credits";
            
            await saveState(state);

            return deepClone({
                balance: state.balance,
                reward,
                recentCredits: state.recentCredits,
            });
        },

        async getProfile() {
            const state = await loadState();
            return deepClone(buildSnapshot(state).profile);
        },
    };
};
