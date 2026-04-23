import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { createSeedState } from "../data/seedState.js";
import { addMinutes, syncDerivedTimes } from "../utils/time.js";

const STATE_KEY = "app_state";
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

const normalizeState = (state) => {
    const seedState = createSeedState();

    state.locationOptions = seedState.locationOptions;
    state.trainTimeOptions = seedState.trainTimeOptions;
    state.busTimeOptions = seedState.busTimeOptions;
    state.carpoolPaymentOptions = seedState.carpoolPaymentOptions;
    state.trainPaymentOptions = seedState.trainPaymentOptions;
    state.busPaymentOptions = seedState.busPaymentOptions;
    state.alertOriginalTime ??= state.booking?.departureTime ?? seedState.alertOriginalTime;
    state.alertSuggestedTime ??= seedState.alertSuggestedTime;
    state.rewards = state.rewards ?? seedState.rewards;

    if (!state.rewards.some((reward) => reward.id === "vep-offset")) {
        state.rewards = [seedState.rewards[0], ...state.rewards];
    }

    syncDerivedTimes(state);
    updateRouteWindow(state);
    return state;
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
            booking: state.carpoolBooking,
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

const createDatabase = () => {
    const dataDir = path.resolve(process.cwd(), "data");
    fs.mkdirSync(dataDir, { recursive: true });

    const dbPath = path.join(dataDir, "swiftflow.sqlite");
    const db = new DatabaseSync(dbPath);

    db.exec(`
        CREATE TABLE IF NOT EXISTS app_state (
            id TEXT PRIMARY KEY,
            state_json TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);

    return db;
};

export const createAppStore = () => {
    const db = createDatabase();
    const selectState = db.prepare("SELECT state_json FROM app_state WHERE id = ?");
    const upsertState = db.prepare(`
        INSERT INTO app_state (id, state_json, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            state_json = excluded.state_json,
            updated_at = CURRENT_TIMESTAMP
    `);

    const readState = () => {
        const row = selectState.get(STATE_KEY);

        if (!row) {
            const seededState = normalizeState(createSeedState());
            upsertState.run(STATE_KEY, JSON.stringify(seededState));
            return seededState;
        }

        return normalizeState(JSON.parse(row.state_json));
    };

    const writeState = (state) => {
        normalizeState(state);
        upsertState.run(STATE_KEY, JSON.stringify(state));
    };

    const mutateState = (handler) => {
        const state = readState();
        const result = handler(state);
        writeState(state);
        return result;
    };

    return {
        getState() {
            return deepClone(readState());
        },

        getSnapshot() {
            return deepClone(buildSnapshot(readState()));
        },

        resetState() {
            const state = normalizeState(createSeedState());
            writeState(state);
            return deepClone(state);
        },

        updateTrainBooking(input) {
            return mutateState((state) => {
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
                    if (state.booking.confirmed) {
                        state.booking.paymentStatus = `Charged to ${paymentMethod}`;
                    }
                }

                updateRouteWindow(state);
                return deepClone(state.booking);
            });
        },

        updateBusBooking(input) {
            return mutateState((state) => {
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
                    state.routeGate = destination.includes("Woodlands") ? "Gate B22" : "Gate C14";
                }

                if (departureTime) {
                    state.busBooking.departureTime = departureTime;
                    syncDerivedTimes(state);
                }

                if (paymentMethod) {
                    state.busBooking.paymentMethod = paymentMethod;
                    if (state.busBooking.confirmed) {
                        state.busBooking.paymentStatus = `Charged to ${paymentMethod}`;
                    }
                }

                updateRouteWindow(state);
                return deepClone(state.busBooking);
            });
        },

        getCarpoolBooking() {
            const state = readState();

            return deepClone({
                drivers: state.carpoolDrivers,
                selectedDriverId: state.selectedCarpoolDriverId,
                selectedDriver: selectedCarpoolDriver(state),
                origin: state.booking.origin,
                booking: state.carpoolBooking,
            });
        },

        selectCarpoolDriver(driverId) {
            return mutateState((state) => {
                const driver = state.carpoolDrivers.find((item) => item.id === driverId);

                if (!driver) {
                    throw new Error("driverId does not match an available carpool driver.");
                }

                state.selectedCarpoolDriverId = driverId;

                return deepClone({
                    drivers: state.carpoolDrivers,
                    selectedDriverId: state.selectedCarpoolDriverId,
                    selectedDriver: selectedCarpoolDriver(state),
                    origin: state.booking.origin,
                    booking: state.carpoolBooking,
                });
            });
        },

        updateCarpoolPayment(paymentMethod) {
            return mutateState((state) => {
                ensureOption(state.carpoolPaymentOptions, paymentMethod, "paymentMethod");
                selectedCarpoolDriver(state).paymentMethod = paymentMethod;

                if (state.carpoolBooking.confirmed) {
                    state.carpoolBooking.paymentStatus = `Charge queued for ${paymentMethod}`;
                }

                return deepClone({
                    drivers: state.carpoolDrivers,
                    selectedDriverId: state.selectedCarpoolDriverId,
                    selectedDriver: selectedCarpoolDriver(state),
                    origin: state.booking.origin,
                    booking: state.carpoolBooking,
                });
            });
        },

        confirmTrainBooking() {
            return mutateState((state) => {
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
                return deepClone(state.booking);
            });
        },

        confirmBusBooking() {
            return mutateState((state) => {
                if (!state.busBooking.confirmed) {
                    state.busBooking.confirmed = true;
                    state.busBooking.status = "Bus Confirmed";
                    state.busBooking.paymentStatus = `Charged to ${state.busBooking.paymentMethod}`;
                    state.busBooking.confirmationCode = buildConfirmationCode("BUS");
                    state.routeMode = state.busBooking.route;
                }

                state.activeTab = "bus-booking";
                return deepClone(state.busBooking);
            });
        },

        confirmCarpoolBooking() {
            return mutateState((state) => {
                const driver = selectedCarpoolDriver(state);

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

                return deepClone({
                    drivers: state.carpoolDrivers,
                    selectedDriverId: state.selectedCarpoolDriverId,
                    selectedDriver: selectedCarpoolDriver(state),
                    origin: state.booking.origin,
                    booking: state.carpoolBooking,
                });
            });
        },

        activateCheckIn() {
            return mutateState((state) => {
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
                return deepClone(buildSnapshot(state));
            });
        },

        acceptAlert() {
            return mutateState((state) => {
                if (!state.alertAccepted) {
                    state.alertOriginalTime = state.booking.departureTime;
                    state.alertSuggestedTime = addMinutes(state.booking.departureTime, 30);
                    state.booking.departureTime = state.alertSuggestedTime;
                    syncDerivedTimes(state);
                    state.alertAccepted = true;
                    state.checkInAccepted = true;
                    state.passReady = true;
                    state.routeMode = "RTS Link";
                    state.routeGate = "North Bridge RTS Transfer";
                    state.balance += 80;
                }

                state.routeWindow = `${state.booking.departureTime} - ${state.booking.arrivalTime}`;
                state.activeTab = "alerts";

                return deepClone({
                    accepted: state.alertAccepted,
                    routeMode: state.routeMode,
                    routeGate: state.routeGate,
                    routeWindow: state.routeWindow,
                    balance: state.balance,
                });
            });
        },

        getCredits() {
            return deepClone(buildSnapshot(readState()).credits);
        },

        getRewards() {
            const state = readState();

            return deepClone({
                rewards: state.rewards,
                balance: state.balance,
            });
        },

        redeemReward(rewardId) {
            return mutateState((state) => {
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

                return deepClone({
                    balance: state.balance,
                    reward,
                    recentCredits: state.recentCredits,
                });
            });
        },

        getProfile() {
            return deepClone(buildSnapshot(readState()).profile);
        },
    };
};
