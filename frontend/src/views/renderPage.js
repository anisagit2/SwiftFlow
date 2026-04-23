import { renderAlertsPage } from "./pages/alerts.js";
import { renderBusBookingPage } from "./pages/busBooking.js";
import { renderCarpoolBookingPage } from "./pages/carpoolBooking.js";
import { renderCarpoolPickupPage } from "./pages/carpoolPickup.js";
import { renderCreditsPage } from "./pages/credits.js";
import { renderExplorePage } from "./pages/explore.js";
import { renderPassportCheckinPage } from "./pages/passportCheckin.js";
import { renderProfilePage } from "./pages/profile.js";
import { renderRewardsPage } from "./pages/rewards.js";
import { renderTrainBookingPage } from "./pages/trainBooking.js";

export const renderPage = (state) => {
    if (state.activeTab === "alerts") return renderAlertsPage(state);
    if (state.activeTab === "booking") return renderTrainBookingPage(state);
    if (state.activeTab === "bus-booking") return renderBusBookingPage(state);
    if (state.activeTab === "carpool-booking") return renderCarpoolBookingPage(state);
    if (state.activeTab === "carpool-pickup") return renderCarpoolPickupPage(state);
    if (state.activeTab === "passport-checkin") return renderPassportCheckinPage(state);
    if (state.activeTab === "credits") return renderCreditsPage(state);
    if (state.activeTab === "rewards") return renderRewardsPage(state);
    if (state.activeTab === "profile") return renderProfilePage(state);
    return renderExplorePage(state);
};
