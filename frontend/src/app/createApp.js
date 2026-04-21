import { createInitialState } from "../data/initialState.js";
import {
    acceptAlert,
    activateCheckIn,
    openPass,
    redeemReward,
    selectDriver,
    setActiveTab,
    updateBusOrigin,
    updateBusPayment,
    updateBusTime,
    updateCarpoolPayment,
    updateDestination,
    updateOrigin,
    updateTrainPayment,
    updateTrainTime,
} from "../state/mutations.js";
import { syncDerivedTimes, formatCountdown } from "../utils/time.js";
import { renderLayout } from "../views/layout.js";
import { renderPage } from "../views/renderPage.js";

export const createApp = (root) => {
    const state = createInitialState();

    const render = () => {
        root.innerHTML = renderLayout(state, renderPage(state));
    };

    const handleAction = (actionTarget) => {
        const { action, reward, target, driver } = actionTarget.dataset;

        if (action === "accept-checkin") {
            activateCheckIn(state);
            return;
        }

        if (action === "accept-alert") {
            acceptAlert(state);
            return;
        }

        if (action === "open-pass") {
            openPass(state);
            return;
        }

        if (action === "switch-tab" && target) {
            setActiveTab(state, target);
            return;
        }

        if (action === "redeem" && reward) {
            redeemReward(state, reward);
            return;
        }

        if (action === "select-driver" && driver) {
            selectDriver(state, driver);
        }
    };

    const handleFieldChange = (field, value) => {
        if (field === "destination") {
            updateDestination(state, value);
            return;
        }

        if (field === "origin") {
            updateOrigin(state, value);
            return;
        }

        if (field === "bus-origin") {
            updateBusOrigin(state, value);
            return;
        }

        if (field === "train-time") {
            updateTrainTime(state, value);
            return;
        }

        if (field === "bus-time") {
            updateBusTime(state, value);
            return;
        }

        if (field === "train-payment") {
            updateTrainPayment(state, value);
            return;
        }

        if (field === "bus-payment") {
            updateBusPayment(state, value);
            return;
        }

        if (field === "carpool-payment") {
            updateCarpoolPayment(state, value);
        }
    };

    root.addEventListener("click", (event) => {
        const navTarget = event.target.closest("[data-nav]");
        if (navTarget) {
            setActiveTab(state, navTarget.dataset.nav);
            render();
            return;
        }

        const actionTarget = event.target.closest("[data-action]");
        if (!actionTarget) {
            return;
        }

        handleAction(actionTarget);
        render();
    });

    root.addEventListener("change", (event) => {
        const field = event.target.dataset.field;
        if (!field) {
            return;
        }

        handleFieldChange(field, event.target.value);
        render();
    });

    window.setInterval(() => {
        if (state.countdownSeconds > 0) {
            state.countdownSeconds -= 1;
        }

        const countdownEl = document.querySelector("#countdown-value");
        if (countdownEl) {
            countdownEl.textContent = formatCountdown(state.countdownSeconds);
        }
    }, 1000);

    syncDerivedTimes(state);
    render();
};
