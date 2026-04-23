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
const currentTimestamp = () => new Date().toISOString();

const toReadableDate = (value) => {
    if (!value) {
        return null;
    }

    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const buildTripHistoryEntry = (booking, state) => ({
    id: `${booking.id}-${booking.confirmedAt ?? booking.updatedAt ?? currentTimestamp()}`,
    bookingId: booking.id,
    type: booking.type,
    label: booking.status,
    origin: booking.origin,
    destination: booking.destination,
    departureTime: booking.departureTime,
    arrivalTime: booking.arrivalTime,
    routeMode: state.routeMode,
    routeGate: state.routeGate,
    paymentStatus: booking.paymentStatus,
    confirmationCode: booking.confirmationCode,
    passStatus: booking.passStatus,
    recordedAt: booking.confirmedAt ?? booking.updatedAt ?? currentTimestamp(),
});

const updateProfileSummary = (state) => {
    state.profileDetails = {
        ...state.profileDetails,
        activeTrips: [state.booking.confirmed, state.busBooking.confirmed, state.carpoolBooking.confirmed].filter(Boolean).length,
        primaryMode: state.profileDetails?.primaryMode ?? state.routeMode,
        preferredDestination: state.profileDetails?.preferredDestination ?? state.booking.destination,
        latestDepartureTime: state.booking.departureTime,
        latestConfirmationCode: state.booking.confirmationCode,
        passReady: state.passReady,
    };
};

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
        details: state.profileDetails,
        tripHistory: state.tripHistory,
        checkIn: state.checkInDetails,
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

        updateTrainBooking(_user, input = {}) {
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
                }

                if (origin || destination || departureTime || paymentMethod) {
                    state.booking.updatedAt = currentTimestamp();
                    if (state.booking.confirmed) {
                        state.booking.paymentStatus = `Charged to ${state.booking.paymentMethod}`;
                        state.booking.passStatus = "ready";
                        state.booking.reservationStatus = "confirmed";
                    }
                }

                updateRouteWindow(state);
                return deepClone(state.booking);
            });
        },

        updateBusBooking(_user, input = {}) {
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
                }

                if (origin || destination || departureTime || paymentMethod) {
                    state.busBooking.updatedAt = currentTimestamp();
                    if (state.busBooking.confirmed) {
                        state.busBooking.paymentStatus = `Charged to ${state.busBooking.paymentMethod}`;
                        state.busBooking.passStatus = "ready";
                        state.busBooking.reservationStatus = "confirmed";
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

        selectCarpoolDriver(_user, driverId) {
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

        updateCarpoolPayment(_user, paymentMethod) {
            return mutateState((state) => {
                ensureOption(state.carpoolPaymentOptions, paymentMethod, "paymentMethod");
                selectedCarpoolDriver(state).paymentMethod = paymentMethod;

                if (state.carpoolBooking.confirmed) {
                    state.carpoolBooking.paymentStatus = `Charge queued for ${paymentMethod}`;
                    state.carpoolBooking.updatedAt = currentTimestamp();
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
                state.booking.confirmed = true;
                state.booking.status = "RTS Confirmed";
                state.booking.reservationStatus = "confirmed";
                state.booking.passStatus = "ready";
                state.booking.paymentStatus = `Charged to ${state.booking.paymentMethod}`;
                state.booking.confirmationCode = state.booking.confirmationCode ?? buildConfirmationCode("RTS");
                state.booking.confirmedAt = state.booking.confirmedAt ?? currentTimestamp();
                state.booking.updatedAt = currentTimestamp();
                state.passReady = true;
                state.routeMode = "RTS Link";

                const historyEntry = buildTripHistoryEntry(state.booking, state);
                state.tripHistory = [historyEntry, ...(state.tripHistory ?? []).filter((entry) => entry.bookingId !== state.booking.id)].slice(0, 5);
                updateProfileSummary(state);
                state.activeTab = "booking";
                updateRouteWindow(state);
                return deepClone(state.booking);
            });
        },

        confirmBusBooking() {
            return mutateState((state) => {
                state.busBooking.confirmed = true;
                state.busBooking.status = "Bus Confirmed";
                state.busBooking.reservationStatus = "confirmed";
                state.busBooking.passStatus = "ready";
                state.busBooking.paymentStatus = `Charged to ${state.busBooking.paymentMethod}`;
                state.busBooking.confirmationCode = state.busBooking.confirmationCode ?? buildConfirmationCode("BUS");
                state.busBooking.confirmedAt = state.busBooking.confirmedAt ?? currentTimestamp();
                state.busBooking.updatedAt = currentTimestamp();
                state.routeMode = state.busBooking.route;

                const historyEntry = buildTripHistoryEntry(state.busBooking, state);
                state.tripHistory = [historyEntry, ...(state.tripHistory ?? []).filter((entry) => entry.bookingId !== state.busBooking.id)].slice(0, 5);
                updateProfileSummary(state);
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
                    state.carpoolBooking.confirmationCode = buildConfirmationCode("CAR");
                }

                driver.reservationStatus = "Reserved";
                state.carpoolBooking.confirmed = true;
                state.carpoolBooking.driverId = driver.id;
                state.carpoolBooking.status = "Carpool Reserved";
                state.carpoolBooking.paymentStatus = `Charge queued for ${driver.paymentMethod}`;
                state.carpoolBooking.confirmedAt = state.carpoolBooking.confirmedAt ?? currentTimestamp();
                state.carpoolBooking.updatedAt = currentTimestamp();
                state.routeMode = "Taxi Carpool";
                updateProfileSummary(state);
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

        redeemReward(_user, rewardId) {
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

        getTripHistory() {
            return deepClone(readState().tripHistory ?? []);
        },

        updateProfile(_user, input = {}) {
            return mutateState((state) => {
                const displayName = typeof input.displayName === "string"
                    ? input.displayName.trim()
                    : state.profileDetails?.displayName;
                const email = typeof input.email === "string"
                    ? input.email.trim()
                    : state.profileDetails?.email;

                state.profileDetails = {
                    ...state.profileDetails,
                    displayName: displayName || "SwiftFlow User",
                    email: email || null,
                    memberSince: state.profileDetails?.memberSince ?? toReadableDate(currentTimestamp()),
                    primaryMode: state.routeMode,
                    preferredDestination: state.booking.destination,
                };
                updateProfileSummary(state);

                return deepClone({
                    details: state.profileDetails,
                });
            });
        },
    };
};
