import { buildConfirmationCode, createDocumentSubmissionStatuses, currentTimestamp } from "./helpers.js";
import { createInitialState } from "../data/initialState.js";

export const refreshProfileSummary = (state) => {
    state.profileDetails = {
        ...state.profileDetails,
        activeTrips: [state.booking.confirmed, state.busBooking.confirmed, state.carpoolBooking.confirmed].filter(Boolean).length,
        primaryMode: state.routeMode,
        preferredDestination: state.booking.destination,
        latestDepartureTime: state.booking.departureTime,
        latestConfirmationCode: state.booking.confirmationCode,
        passReady: state.passReady,
    };
};

export const addTripHistory = (state, booking) => {
    const entry = {
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
    };

    state.tripHistory = [entry, ...(state.tripHistory ?? []).filter((item) => item.bookingId !== booking.id)].slice(0, 5);
};

export const confirmTrainLocally = (state) => {
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
    state.routeWindow = `${state.booking.departureTime} - ${state.booking.arrivalTime}`;
    addTripHistory(state, state.booking);
    refreshProfileSummary(state);
};

export const confirmBusLocally = (state) => {
    state.busBooking.confirmed = true;
    state.busBooking.status = "Bus Confirmed";
    state.busBooking.reservationStatus = "confirmed";
    state.busBooking.passStatus = "ready";
    state.busBooking.paymentStatus = `Charged to ${state.busBooking.paymentMethod}`;
    state.busBooking.confirmationCode = state.busBooking.confirmationCode ?? buildConfirmationCode("BUS");
    state.busBooking.confirmedAt = state.busBooking.confirmedAt ?? currentTimestamp();
    state.busBooking.updatedAt = currentTimestamp();
    state.routeMode = state.busBooking.route;
    state.profileQrMode = "bus";
    addTripHistory(state, state.busBooking);
    refreshProfileSummary(state);
};

export const confirmCarpoolLocally = (state) => {
    const driver = state.carpoolDrivers.find((item) => item.id === state.selectedCarpoolDriverId) ?? state.carpoolDrivers[0];
    const seatCount = Number(driver.seats.match(/\d+/)?.[0] ?? 0);

    if (!state.carpoolBooking.confirmed || state.carpoolBooking.driverId !== driver.id) {
        driver.seats = `${Math.max(0, seatCount - 1)} seat${seatCount - 1 === 1 ? "" : "s"} left`;
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
    refreshProfileSummary(state);
};

export const activateCheckInLocally = (state) => {
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

export const saveProfileLocally = (state) => {
    state.profileDetails = {
        ...state.profileDetails,
        displayName: state.profileDraft?.displayName?.trim() || "SwiftFlow User",
        email: state.profileDraft?.email?.trim() || null,
        memberSince: state.profileDetails?.memberSince ?? new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }),
    };
    refreshProfileSummary(state);
};

export const resetStateLocally = (state) => {
    Object.assign(state, createInitialState(), {
        isBootstrapping: false,
        isAuthenticated: state.isAuthenticated,
        authUserId: state.authUserId,
        isBackendConnected: false,
        authDisplayName: state.authDisplayName,
        authInitials: state.authInitials,
        pendingAction: "",
        errorMessage: "",
        noticeMessage: "",
        selectedRewardId: "vep-offset",
        showAlertRoutes: false,
        profileQrMode: "rts",
        isEditingProfile: false,
        profileDraft: null,
        documentSubmissionStatuses: createDocumentSubmissionStatuses(),
    });
};
