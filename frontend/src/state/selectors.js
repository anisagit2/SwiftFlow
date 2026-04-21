export const selectedCarpoolDriver = (state) =>
    state.carpoolDrivers.find((driver) => driver.id === state.selectedCarpoolDriverId) ?? state.carpoolDrivers[0];

export const creditsProgress = (state) => Math.min(100, (state.balance / state.goalCredits) * 100);

export const topbarTitle = (state) => {
    if (state.activeTab === "alerts") return "Live Alerts";
    if (state.activeTab === "booking") return "RTS Booking";
    if (state.activeTab === "bus-booking") return "Bus Booking";
    if (state.activeTab === "carpool-booking") return "Taxi Carpool";
    if (state.activeTab === "credits") return "Green Credits";
    if (state.activeTab === "rewards") return "Rewards Marketplace";
    if (state.activeTab === "profile") return "Profile";
    return "SwiftFlow JSIC";
};
