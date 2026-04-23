const deepClone = (value) => JSON.parse(JSON.stringify(value));

const selectedCarpoolDriver = (state) =>
    state.carpoolDrivers.find((driver) => driver.id === state.selectedCarpoolDriverId) ?? state.carpoolDrivers[0];

export const buildSnapshot = (state) => ({
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
        details: state.alertDetails,
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
        ledger: state.creditLedger,
    },
    rewards: {
        items: state.rewards,
        redemptions: state.rewardRedemptions,
        balance: state.balance,
    },
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

export const buildCarpoolBookingPayload = (state) => ({
    drivers: state.carpoolDrivers,
    selectedDriverId: state.selectedCarpoolDriverId,
    selectedDriver: selectedCarpoolDriver(state),
    origin: state.booking.origin,
    booking: state.carpoolBooking,
});

export const clone = (value) => deepClone(value);
