import { apiClient } from "../api/client.js";
import { currentTimestamp } from "./helpers.js";
import { syncDerivedTimes } from "../utils/time.js";

const hasBackendSession = (state) => state.isAuthenticated && state.isBackendConnected;

const setFeedbackAndRender = (state, render, noticeMessage) => {
    state.noticeMessage = noticeMessage;
    state.errorMessage = "";
    render();
};

const runRemoteUpdate = async (state, runRequest, field, task, successMessage) => {
    if (!hasBackendSession(state)) {
        return;
    }

    await runRequest(field, task, {
        successMessage,
    });
};

export const createFieldChangeHandler = ({ state, render, runRequest }) => async (field, value) => {
    if (field === "destination") {
        if (state.activeTab === "bus-booking") {
            state.busBooking.destination = value;
            if (state.busBooking.confirmed) {
                state.busBooking.updatedAt = currentTimestamp();
                state.busBooking.paymentStatus = `Charged to ${state.busBooking.paymentMethod}`;
            }
        } else {
            state.booking.destination = value;
            if (state.booking.confirmed) {
                state.booking.updatedAt = currentTimestamp();
                state.booking.paymentStatus = `Charged to ${state.booking.paymentMethod}`;
            }
        }

        setFeedbackAndRender(state, render, "Destination updated.");

        const updateDestination = state.activeTab === "bus-booking"
            ? () => apiClient.updateBusBooking({ destination: value })
            : () => apiClient.updateTrainBooking({ destination: value });

        await runRemoteUpdate(state, runRequest, field, updateDestination, "Destination updated.");
        return;
    }

    if (field === "origin") {
        state.booking.origin = value;
        if (state.booking.confirmed) {
            state.booking.updatedAt = currentTimestamp();
        }

        setFeedbackAndRender(state, render, "Origin updated.");
        await runRemoteUpdate(state, runRequest, field, () => apiClient.updateTrainBooking({ origin: value }), "Origin updated.");
        return;
    }

    if (field === "bus-origin") {
        state.busBooking.origin = value;
        if (state.busBooking.confirmed) {
            state.busBooking.updatedAt = currentTimestamp();
        }

        setFeedbackAndRender(state, render, "Bus origin updated.");
        await runRemoteUpdate(state, runRequest, field, () => apiClient.updateBusBooking({ origin: value }), "Bus origin updated.");
        return;
    }

    if (field === "train-time") {
        state.booking.departureTime = value;
        syncDerivedTimes(state);
        if (state.booking.confirmed) {
            state.booking.updatedAt = currentTimestamp();
        }

        setFeedbackAndRender(state, render, "RTS departure time updated.");
        await runRemoteUpdate(
            state,
            runRequest,
            field,
            () => apiClient.updateTrainBooking({ departureTime: value }),
            "RTS departure time updated.",
        );
        return;
    }

    if (field === "bus-time") {
        state.busBooking.departureTime = value;
        syncDerivedTimes(state);
        if (state.busBooking.confirmed) {
            state.busBooking.updatedAt = currentTimestamp();
        }

        setFeedbackAndRender(state, render, "Bus departure time updated.");
        await runRemoteUpdate(
            state,
            runRequest,
            field,
            () => apiClient.updateBusBooking({ departureTime: value }),
            "Bus departure time updated.",
        );
        return;
    }

    if (field === "train-payment") {
        state.booking.paymentMethod = value;
        if (state.booking.confirmed) {
            state.booking.paymentStatus = `Charged to ${value}`;
            state.booking.updatedAt = currentTimestamp();
        }

        setFeedbackAndRender(state, render, "RTS payment method updated.");
        await runRemoteUpdate(
            state,
            runRequest,
            field,
            () => apiClient.updateTrainBooking({ paymentMethod: value }),
            "RTS payment method updated.",
        );
        return;
    }

    if (field === "bus-payment") {
        state.busBooking.paymentMethod = value;
        if (state.busBooking.confirmed) {
            state.busBooking.paymentStatus = `Charged to ${value}`;
            state.busBooking.updatedAt = currentTimestamp();
        }

        setFeedbackAndRender(state, render, "Bus payment method updated.");
        await runRemoteUpdate(
            state,
            runRequest,
            field,
            () => apiClient.updateBusBooking({ paymentMethod: value }),
            "Bus payment method updated.",
        );
        return;
    }

    if (field === "carpool-payment") {
        const selectedDriver = state.carpoolDrivers.find((item) => item.id === state.selectedCarpoolDriverId);
        if (selectedDriver) {
            selectedDriver.paymentMethod = value;
        }
        if (state.carpoolBooking.confirmed) {
            state.carpoolBooking.paymentStatus = `Charge queued for ${value}`;
            state.carpoolBooking.updatedAt = currentTimestamp();
        }

        setFeedbackAndRender(state, render, "Carpool payment method updated.");
        await runRemoteUpdate(
            state,
            runRequest,
            field,
            () => apiClient.updateCarpoolPayment(value),
            "Carpool payment method updated.",
        );
    }
};
