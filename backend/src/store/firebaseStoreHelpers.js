import { createSeedState } from "../data/seedState.js";
import { syncDerivedTimes } from "../utils/time.js";

export const USERS_COLLECTION = "users";

export const ensureOption = (options, value, label) => {
    if (value === undefined) {
        return;
    }

    if (!options.includes(value)) {
        throw new Error(`${label} must be one of the configured options.`);
    }
};

export const pushCreditActivity = (state, entry) => {
    state.recentCredits.unshift(entry);
};

export const updateRouteWindow = (state) => {
    state.routeWindow = `${state.booking.departureTime} - ${state.booking.arrivalTime}`;
};

export const buildConfirmationCode = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
export const currentTimestamp = () => new Date().toISOString();
export const buildTrainFare = (destination) => (destination?.includes("Woodlands") ? "RM 16.00" : "RM 18.00");
export const buildRouteGate = (destination) => (destination?.includes("Woodlands") ? "Gate B22" : "Gate C14");
export const buildBusFare = (destination) => (destination?.includes("Checkpoint") ? "RM 4.50" : "RM 6.00");
export const buildMockPaymentStatus = (paymentMethod) => `Mock payment method selected: ${paymentMethod}`;
export const buildMockQueuedPaymentStatus = (paymentMethod) => `Mock payment preview saved for ${paymentMethod}`;

export const toReadableDate = (value) => {
    if (!value) {
        return null;
    }

    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export const decorateTrainBooking = (booking) => ({
    id: booking.id ?? "train-active",
    type: "train",
    tripId: booking.tripId ?? "active",
    reservationStatus: booking.reservationStatus ?? (booking.confirmed ? "confirmed" : "draft"),
    passStatus: booking.passStatus ?? (booking.confirmed ? "ready" : "not_ready"),
    confirmedAt: booking.confirmedAt ?? null,
    updatedAt: booking.updatedAt ?? null,
    ...booking,
});

export const decorateBusBooking = (booking) => ({
    id: booking.id ?? "bus-active",
    type: "bus",
    tripId: booking.tripId ?? "active",
    reservationStatus: booking.reservationStatus ?? (booking.confirmed ? "confirmed" : "draft"),
    passStatus: booking.passStatus ?? (booking.confirmed ? "ready" : "not_ready"),
    confirmedAt: booking.confirmedAt ?? null,
    updatedAt: booking.updatedAt ?? null,
    ...booking,
});

export const buildTripHistoryEntry = (booking, trip) => ({
    id: `${booking.id}-${booking.confirmedAt ?? booking.updatedAt ?? currentTimestamp()}`,
    bookingId: booking.id,
    type: booking.type,
    label: booking.status,
    origin: booking.origin,
    destination: booking.destination,
    departureTime: booking.departureTime,
    arrivalTime: booking.arrivalTime,
    routeMode: trip.routeMode,
    routeGate: trip.routeGate,
    paymentStatus: booking.paymentStatus,
    confirmationCode: booking.confirmationCode,
    passStatus: booking.passStatus,
    recordedAt: booking.confirmedAt ?? booking.updatedAt ?? currentTimestamp(),
});

export const buildProfileReadModel = (state, user, memberSince, tripHistory = []) => ({
    displayName: state.profileDetails?.displayName ?? user.displayName ?? user.email ?? "SwiftFlow User",
    email: state.profileDetails?.email ?? user.email ?? null,
    photoURL: state.profileDetails?.photoURL ?? user.photoURL ?? null,
    memberSince: memberSince ?? null,
    activeTrips: [state.booking?.confirmed, state.busBooking?.confirmed, state.carpoolBooking?.confirmed].filter(Boolean).length,
    primaryMode: state.profileDetails?.primaryMode ?? state.routeMode,
    preferredDestination: state.profileDetails?.preferredDestination ?? state.booking.destination,
    latestDepartureTime: state.booking.departureTime,
    latestConfirmationCode: state.booking.confirmationCode,
    passReady: state.passReady,
    tripHistoryPreview: tripHistory.slice(0, 5),
    homeHub: state.profileDetails?.homeHub ?? null,
    bio: state.profileDetails?.bio ?? null,
});

export const buildCreditTransaction = ({ title, detail, amount, icon }) => ({
    id: `credit-${Math.random().toString(36).slice(2, 10)}`,
    title,
    detail,
    amount,
    icon,
    time: "Just now",
    recordedAt: currentTimestamp(),
});

export const buildRewardRedemption = (reward, balanceAfter) => ({
    id: `redeem-${reward.id}-${Math.random().toString(36).slice(2, 8)}`,
    rewardId: reward.id,
    rewardName: reward.name,
    cost: reward.cost,
    balanceAfter,
    redeemedAt: currentTimestamp(),
    status: "completed",
});

export const decrementSeatsLabel = (seatsLabel) => {
    const match = seatsLabel.match(/(\d+)/);

    if (!match) {
        return seatsLabel;
    }

    const nextSeats = Math.max(0, Number(match[1]) - 1);
    return `${nextSeats} seat${nextSeats === 1 ? "" : "s"} left`;
};

export const timeToMinutes = (time) => {
    const match = /^(\d{2}):(\d{2})$/.exec(time ?? "");
    if (!match) {
        return null;
    }

    return Number(match[1]) * 60 + Number(match[2]);
};

export const isPastDepartureGrace = (departureTime, graceMinutes = 5) => {
    const departureMinutes = timeToMinutes(departureTime);
    if (departureMinutes === null) {
        return false;
    }

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return nowMinutes >= departureMinutes + graceMinutes;
};

export const buildExpiredBooking = (booking) => ({
    ...booking,
    status: booking.type === "bus" ? "Bus Expired" : "RTS Expired",
    reservationStatus: "expired",
    passStatus: "expired",
    expiredAt: currentTimestamp(),
    updatedAt: currentTimestamp(),
});

export const buildReminderAlert = ({ bookingType, booking }) => ({
    status: "trip_reminder",
    incidentType: "departure_reminder",
    title: bookingType === "bus" ? "Bus departure reminder" : "RTS departure reminder",
    message: `${bookingType === "bus" ? "Your bus" : "Your RTS train"} leaves at ${booking.departureTime}. Open your trip details and prepare your QR pass.`,
    suggestedDepartureTime: booking.departureTime,
    acceptedAt: null,
    updatedAt: currentTimestamp(),
});

export const normalizeState = (state) => {
    const seedState = createSeedState();

    state.locationOptions = state.locationOptions ?? seedState.locationOptions;
    state.trainTimeOptions = state.trainTimeOptions ?? seedState.trainTimeOptions;
    state.busTimeOptions = state.busTimeOptions ?? seedState.busTimeOptions;
    state.carpoolPaymentOptions = state.carpoolPaymentOptions ?? seedState.carpoolPaymentOptions;
    state.trainPaymentOptions = state.trainPaymentOptions ?? seedState.trainPaymentOptions;
    state.busPaymentOptions = state.busPaymentOptions ?? seedState.busPaymentOptions;
    state.alertOriginalTime ??= state.booking?.departureTime ?? seedState.alertOriginalTime;
    state.alertSuggestedTime ??= seedState.alertSuggestedTime;
    state.rewards = state.rewards ?? seedState.rewards;
    state.recentCredits = state.recentCredits ?? seedState.recentCredits;
    state.carpoolBooking = state.carpoolBooking ?? seedState.carpoolBooking;
    state.carpoolDrivers = state.carpoolDrivers ?? seedState.carpoolDrivers;
    state.selectedCarpoolDriverId = state.selectedCarpoolDriverId ?? seedState.selectedCarpoolDriverId;
    state.booking = decorateTrainBooking(state.booking ?? seedState.booking);
    state.busBooking = decorateBusBooking(state.busBooking ?? seedState.busBooking);

    syncDerivedTimes(state);
    updateRouteWindow(state);
    return state;
};
