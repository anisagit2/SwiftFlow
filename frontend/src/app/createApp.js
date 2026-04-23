import { createInitialState } from "../data/initialState.js";
import { apiClient } from "../api/client.js";
import { getFirebaseIdToken, initializeFirebaseSession } from "../lib/firebase.js";
import { openPass, setActiveTab } from "../state/mutations.js";
import { syncDerivedTimes, formatCountdown } from "../utils/time.js";
import { renderLayout } from "../views/layout.js";
import { renderPage } from "../views/renderPage.js";

export const createApp = (root) => {
    const state = Object.assign(createInitialState(), {
        isBootstrapping: true,
        isAuthenticated: false,
        authDisplayName: "Guest",
        authInitials: "SF",
        pendingAction: "",
        errorMessage: "",
        noticeMessage: "",
        selectedRewardId: "vep-offset",
        showAlertRoutes: false,
        profileQrMode: "rts",
        isEditingProfile: false,
        profileDraft: null,
    });

    const applyServerState = (serverState, options = {}) => {
        const {
            preserveTab = true,
            preserveCountdown = true,
        } = options;
        const currentActiveTab = state.activeTab;
        const currentCountdownSeconds = state.countdownSeconds;
        const uiState = {
            isBootstrapping: state.isBootstrapping,
            pendingAction: state.pendingAction,
            errorMessage: state.errorMessage,
            noticeMessage: state.noticeMessage,
            selectedRewardId: state.selectedRewardId,
            showAlertRoutes: state.showAlertRoutes,
            profileQrMode: state.profileQrMode,
            isAuthenticated: state.isAuthenticated,
            authDisplayName: state.authDisplayName,
            authInitials: state.authInitials,
            isEditingProfile: state.isEditingProfile,
            profileDraft: state.profileDraft,
        };

        Object.assign(state, serverState, uiState);
        state.activeTab = preserveTab ? currentActiveTab : serverState.activeTab;
        state.countdownSeconds = preserveCountdown ? currentCountdownSeconds : serverState.countdownSeconds;

        if (!state.isEditingProfile) {
            state.profileDraft = {
                displayName: state.profileDetails?.displayName ?? "",
                email: state.profileDetails?.email ?? "",
                preferredDestination: state.profileDetails?.preferredDestination ?? state.booking?.destination ?? "",
                primaryMode: state.profileDetails?.primaryMode ?? state.routeMode ?? "",
                homeHub: state.profileDetails?.homeHub ?? "",
                bio: state.profileDetails?.bio ?? "",
            };
        }
    };

    const render = () => {
        root.innerHTML = renderLayout(state, renderPage(state));
    };

    const applyAuthSession = (session) => {
        if (!session?.enabled || !session.userId) {
            state.isAuthenticated = false;
            state.authDisplayName = "Guest";
            state.authInitials = "SF";
            return;
        }

        const source = session.displayName ?? session.email ?? "SwiftFlow User";
        const parts = source.trim().split(/\s+/).filter(Boolean);
        const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");

        state.isAuthenticated = true;
        state.authDisplayName = source;
        state.authInitials = initials || "SF";
    };

    const syncStateFromServer = async (options = {}) => {
        const serverState = await apiClient.getState();
        applyServerState(serverState, options);
        syncDerivedTimes(state);
    };

    const runRequest = async (pendingAction, task, options = {}) => {
        const {
            successMessage = "",
            nextTab,
            preserveTab = true,
        } = options;

        state.pendingAction = pendingAction;
        state.errorMessage = "";
        state.noticeMessage = "";
        render();

        try {
            await task();
            await syncStateFromServer({ preserveTab });

            if (nextTab) {
                state.activeTab = nextTab;
            }

            state.noticeMessage = successMessage;
        } catch (error) {
            state.errorMessage = error instanceof Error ? error.message : "Something went wrong while syncing with the backend.";
        } finally {
            state.isBootstrapping = false;
            state.pendingAction = "";
            render();
        }
    };

    const handleAction = async (actionTarget) => {
        const { action, reward, target, driver, mode } = actionTarget.dataset;

        if (action === "accept-checkin") {
            await runRequest("accept-checkin", () => apiClient.acceptCheckIn(), {
                successMessage: "RTS slot secured and train page opened.",
                nextTab: "booking",
            });
            return;
        }

        if (action === "accept-alert") {
            await runRequest("accept-alert", () => apiClient.acceptAlert(), {
                successMessage: "New alert slot accepted and updated.",
                nextTab: "alerts",
            });
            return;
        }

        if (action === "open-pass") {
            state.profileQrMode = mode ?? "rts";
            openPass(state);
            state.noticeMessage = state.profileQrMode === "precheckin"
                ? "Passport pre-check-in pass opened in your profile."
                : "Booked RTS QR opened in your profile.";
            state.errorMessage = "";
            render();
            return;
        }

        if (action === "show-profile-pass") {
            state.profileQrMode = mode ?? "rts";
            state.noticeMessage = state.profileQrMode === "precheckin"
                ? "Showing passport pre-check-in pass."
                : "Showing booked RTS QR.";
            state.errorMessage = "";
            render();
            return;
        }

        if (action === "edit-profile") {
            state.isEditingProfile = true;
            state.profileDraft = {
                displayName: state.profileDetails?.displayName ?? "",
                email: state.profileDetails?.email ?? "",
                preferredDestination: state.profileDetails?.preferredDestination ?? state.booking?.destination ?? "",
                primaryMode: state.profileDetails?.primaryMode ?? state.routeMode ?? "",
                homeHub: state.profileDetails?.homeHub ?? "",
                bio: state.profileDetails?.bio ?? "",
            };
            state.noticeMessage = "";
            state.errorMessage = "";
            render();
            return;
        }

        if (action === "cancel-profile-edit") {
            state.isEditingProfile = false;
            state.profileDraft = {
                displayName: state.profileDetails?.displayName ?? "",
                email: state.profileDetails?.email ?? "",
                preferredDestination: state.profileDetails?.preferredDestination ?? state.booking?.destination ?? "",
                primaryMode: state.profileDetails?.primaryMode ?? state.routeMode ?? "",
                homeHub: state.profileDetails?.homeHub ?? "",
                bio: state.profileDetails?.bio ?? "",
            };
            state.noticeMessage = "";
            state.errorMessage = "";
            render();
            return;
        }

        if (action === "save-profile") {
            await runRequest("save-profile", () => apiClient.updateProfile(state.profileDraft ?? {}), {
                successMessage: "Profile saved.",
                nextTab: "profile",
            });
            state.isEditingProfile = false;
            return;
        }

        if (action === "switch-tab" && target) {
            setActiveTab(state, target);
            render();
            return;
        }

        if (action === "toggle-alert-routes") {
            state.showAlertRoutes = !state.showAlertRoutes;
            render();
            return;
        }

        if (action === "select-reward" && reward) {
            state.selectedRewardId = reward;
            state.noticeMessage = `Selected ${state.rewards.find((item) => item.id === reward)?.name ?? "reward"} for redemption.`;
            state.errorMessage = "";
            render();
            return;
        }

        if (action === "redeem" && reward) {
            await runRequest("redeem", () => apiClient.redeemReward(reward), {
                successMessage: "Reward redeemed successfully.",
                nextTab: "credits",
            });
            return;
        }

        if (action === "select-driver" && driver) {
            state.selectedCarpoolDriverId = driver;
            state.noticeMessage = "Driver selected.";
            state.errorMessage = "";
            render();
            await runRequest("select-driver", () => apiClient.selectCarpoolDriver(driver), {
                successMessage: "Selected carpool driver updated.",
            });
            return;
        }

        if (action === "confirm-train") {
            await runRequest("confirm-train", () => apiClient.confirmTrainBooking(), {
                successMessage: "RTS booking confirmed.",
                nextTab: "booking",
            });
            return;
        }

        if (action === "confirm-bus") {
            await runRequest("confirm-bus", () => apiClient.confirmBusBooking(), {
                successMessage: "Bus booking confirmed.",
                nextTab: "bus-booking",
            });
            return;
        }

        if (action === "confirm-carpool") {
            state.activeTab = "carpool-pickup";
            state.noticeMessage = "Opening reserved pickup route...";
            state.errorMessage = "";
            render();
            await runRequest("confirm-carpool", () => apiClient.confirmCarpoolBooking(), {
                successMessage: "Carpool seat reserved.",
                nextTab: "carpool-pickup",
            });
            return;
        }

        if (action === "reset-state") {
            await runRequest("reset-state", () => apiClient.resetState(), {
                successMessage: "Demo data reset. You can replay the booking flow now.",
                nextTab: "explore",
                preserveTab: false,
            });
        }
    };

    const handleFieldChange = async (field, value) => {
        if (field === "destination") {
            if (state.activeTab === "bus-booking") {
                state.busBooking.destination = value;
            } else {
                state.booking.destination = value;
            }
            state.noticeMessage = "Destination updated.";
            state.errorMessage = "";
            render();

            const updateDestination = state.activeTab === "bus-booking"
                ? () => apiClient.updateBusBooking({ destination: value })
                : () => apiClient.updateTrainBooking({ destination: value });

            await runRequest(field, updateDestination, {
                successMessage: "Destination updated.",
            });
            return;
        }

        if (field === "origin") {
            state.booking.origin = value;
            state.noticeMessage = "Origin updated.";
            state.errorMessage = "";
            render();
            await runRequest(field, () => apiClient.updateTrainBooking({ origin: value }), {
                successMessage: "Origin updated.",
            });
            return;
        }

        if (field === "bus-origin") {
            state.busBooking.origin = value;
            state.noticeMessage = "Bus origin updated.";
            state.errorMessage = "";
            render();
            await runRequest(field, () => apiClient.updateBusBooking({ origin: value }), {
                successMessage: "Bus origin updated.",
            });
            return;
        }

        if (field === "train-time") {
            state.booking.departureTime = value;
            syncDerivedTimes(state);
            state.noticeMessage = "RTS departure time updated.";
            state.errorMessage = "";
            render();
            await runRequest(field, () => apiClient.updateTrainBooking({ departureTime: value }), {
                successMessage: "RTS departure time updated.",
            });
            return;
        }

        if (field === "bus-time") {
            state.busBooking.departureTime = value;
            syncDerivedTimes(state);
            state.noticeMessage = "Bus departure time updated.";
            state.errorMessage = "";
            render();
            await runRequest(field, () => apiClient.updateBusBooking({ departureTime: value }), {
                successMessage: "Bus departure time updated.",
            });
            return;
        }

        if (field === "train-payment") {
            state.booking.paymentMethod = value;
            state.noticeMessage = "RTS payment method updated.";
            state.errorMessage = "";
            render();
            await runRequest(field, () => apiClient.updateTrainBooking({ paymentMethod: value }), {
                successMessage: "RTS payment method updated.",
            });
            return;
        }

        if (field === "bus-payment") {
            state.busBooking.paymentMethod = value;
            state.noticeMessage = "Bus payment method updated.";
            state.errorMessage = "";
            render();
            await runRequest(field, () => apiClient.updateBusBooking({ paymentMethod: value }), {
                successMessage: "Bus payment method updated.",
            });
            return;
        }

        if (field === "carpool-payment") {
            const selectedDriver = state.carpoolDrivers.find((item) => item.id === state.selectedCarpoolDriverId);
            if (selectedDriver) {
                selectedDriver.paymentMethod = value;
            }
            state.noticeMessage = "Carpool payment method updated.";
            state.errorMessage = "";
            render();
            await runRequest(field, () => apiClient.updateCarpoolPayment(value), {
                successMessage: "Carpool payment method updated.",
            });
        }
    };

    root.addEventListener("click", async (event) => {
        const navTarget = event.target.closest("[data-nav]");
        if (navTarget) {
            state.errorMessage = "";
            state.noticeMessage = "";
            setActiveTab(state, navTarget.dataset.nav);
            render();
            return;
        }

        const actionTarget = event.target.closest("[data-action]");
        if (!actionTarget) {
            return;
        }

        await handleAction(actionTarget);
    });

    root.addEventListener("change", async (event) => {
        const field = event.target.dataset.field;
        if (!field) {
            return;
        }

        await handleFieldChange(field, event.target.value);
    });

    root.addEventListener("input", (event) => {
        const profileField = event.target.dataset.profileField;
        if (!profileField) {
            return;
        }

        state.profileDraft = state.profileDraft ?? {};
        state.profileDraft[profileField] = event.target.value;
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
    apiClient.setAuthTokenGetter(getFirebaseIdToken);

    initializeFirebaseSession()
        .then((session) => {
            applyAuthSession(session);

            if (!session?.userId) {
                state.noticeMessage = "Guest profile is running locally on this device.";
                return null;
            }

            return syncStateFromServer({ preserveTab: false, preserveCountdown: false });
        })
        .catch((error) => {
            state.errorMessage = error instanceof Error ? error.message : "Unable to create a guest profile or reach the backend.";
        })
        .finally(() => {
            state.isBootstrapping = false;
            render();
        });
};
