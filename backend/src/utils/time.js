export const addMinutes = (time, minutesToAdd) => {
    const [hours, minutes] = time.split(":").map(Number);
    const total = hours * 60 + minutes + minutesToAdd;
    const normalized = ((total % (24 * 60)) + (24 * 60)) % (24 * 60);
    const nextHours = String(Math.floor(normalized / 60)).padStart(2, "0");
    const nextMinutes = String(normalized % 60).padStart(2, "0");
    return `${nextHours}:${nextMinutes}`;
};

export const syncDerivedTimes = (state) => {
    state.booking.arrivalTime = addMinutes(state.booking.departureTime, 15);
    state.booking.estimatedBorderArrival = addMinutes(state.booking.arrivalTime, 18);
    state.busBooking.arrivalTime = addMinutes(state.busBooking.departureTime, 40);
    state.busBooking.estimatedBorderArrival = addMinutes(state.busBooking.arrivalTime, 18);
};
