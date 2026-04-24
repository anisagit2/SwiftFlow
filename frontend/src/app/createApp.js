import { createInitialState } from "../data/initialState.js";
import { apiClient } from "../api/client.js";
import {
    compressProfilePhoto,
    createDocumentSubmissionStatuses,
    currentTimestamp,
    delay,
    hasConfirmedDocumentSubmission,
    normalizeDocumentSubmissionStatuses,
} from "./helpers.js";
import { getFirebaseIdToken, initializeFirebaseSession, uploadProfilePicture } from "../lib/firebase.js";
import { initializeGoogleMapsFeatures } from "../lib/googleMaps.js";
import {
    activateCheckInLocally,
    confirmBusLocally,
    confirmCarpoolLocally,
    confirmTrainLocally,
    resetStateLocally,
    saveProfileLocally,
} from "./localState.js";
import { openPass, setActiveTab } from "../state/mutations.js";
import { syncDerivedTimes, formatCountdown } from "../utils/time.js";
import { renderLayout } from "../views/layout.js";
import { renderPage } from "../views/renderPage.js";

export const createApp = (root) => {
    let pendingScrollTargetId = "";
    const state = Object.assign(createInitialState(), {
        isBootstrapping: true,
        isAuthenticated: false,
        authUserId: null,
        isBackendConnected: false,
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
        documentSubmissionStatuses: createDocumentSubmissionStatuses(),
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
            authUserId: state.authUserId,
            isBackendConnected: state.isBackendConnected,
            authDisplayName: state.authDisplayName,
            authInitials: state.authInitials,
            isEditingProfile: state.isEditingProfile,
            profileDraft: state.profileDraft,
            documentSubmissionStatuses: normalizeDocumentSubmissionStatuses(state.documentSubmissionStatuses),
        };

        Object.assign(state, serverState, uiState);
        state.documentSubmissionStatuses = normalizeDocumentSubmissionStatuses(state.documentSubmissionStatuses);
        state.activeTab = preserveTab ? currentActiveTab : serverState.activeTab;
        state.countdownSeconds = preserveCountdown ? currentCountdownSeconds : serverState.countdownSeconds;

        if (!state.isEditingProfile) {
            state.profileDraft = {
                displayName: state.profileDetails?.displayName ?? "",
                email: state.profileDetails?.email ?? "",
            };
        }
    };

    const render = () => {
        root.innerHTML = renderLayout(state, renderPage(state));
        initializeGoogleMapsFeatures(root, state, {
            onPlaceSelected: (field, value) => {
                if (field && value) {
                    handleFieldChange(field, value);
                }
            },
            onRouteEstimated: (driverId, durationText) => {
                const driver = state.carpoolDrivers.find((item) => item.id === driverId);
                if (driver && durationText) {
                    driver.pickupEta = durationText;
                    const etaElement = root.querySelector("[data-route-eta]");
                    if (etaElement) {
                        etaElement.textContent = durationText;
                    }
                }
            },
        });
        if (pendingScrollTargetId) {
            const targetId = pendingScrollTargetId;
            pendingScrollTargetId = "";
            window.requestAnimationFrame(() => {
                document.getElementById(targetId)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            });
        }
    };

    const applyAuthSession = (session) => {
        if (!session?.enabled || !session.userId) {
            state.isAuthenticated = false;
            state.authUserId = null;
            state.authDisplayName = "Guest";
            state.authInitials = "SF";
            return;
        }

        const source = session.displayName ?? session.email ?? "SwiftFlow User";
        const parts = source.trim().split(/\s+/).filter(Boolean);
        const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");

        state.isAuthenticated = true;
        state.authUserId = session.userId;
        state.authDisplayName = source;
        state.authInitials = initials || "SF";
    };

    const syncStateFromServer = async (options = {}) => {
        const serverState = await apiClient.getState();
        applyServerState(serverState, options);
        state.isBackendConnected = true;
        syncDerivedTimes(state);
    };

    const runRequest = async (pendingAction, task, options = {}) => {
        const {
            successMessage = "",
            nextTab,
            preserveTab = true,
            syncAfter = true,
        } = options;

        state.pendingAction = pendingAction;
        state.errorMessage = "";
        state.noticeMessage = "";
        render();

        try {
            await task();
            if (syncAfter) {
                await syncStateFromServer({ preserveTab });
            }

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
            const useBackend = state.isAuthenticated && state.isBackendConnected;
            await runRequest("accept-checkin", useBackend ? () => apiClient.acceptCheckIn() : () => activateCheckInLocally(state), {
                successMessage: "RTS slot secured and train page opened.",
                nextTab: "booking",
                syncAfter: useBackend,
            });
            return;
        }

        if (action === "open-alert-comparison") {
            state.activeTab = "alerts";
            state.showAlertRoutes = true;
            state.noticeMessage = "Showing road congestion against faster train options.";
            state.errorMessage = "";
            render();
            return;
        }

        if (action === "submit-arrival-card") {
            const card = actionTarget.dataset.card === "mdac" ? "mdac" : "sgac";
            state.documentSubmissionStatuses = {
                ...normalizeDocumentSubmissionStatuses(state.documentSubmissionStatuses),
                [card]: "syncing",
            };
            state.noticeMessage = "";
            state.errorMessage = "";
            render();
            await delay(800);
            state.documentSubmissionStatuses = {
                ...normalizeDocumentSubmissionStatuses(state.documentSubmissionStatuses),
                [card]: "verifying",
            };
            render();
            await delay(800);
            state.documentSubmissionStatuses = {
                ...normalizeDocumentSubmissionStatuses(state.documentSubmissionStatuses),
                [card]: "confirmed",
            };
            state.checkInAccepted = true;
            state.passReady = true;
            state.profileQrMode = "precheckin";
            state.noticeMessage = "Submission confirmed.";
            render();
            return;
        }

        if (action === "open-confirmed-precheckin-pass") {
            if (!hasConfirmedDocumentSubmission(state)) {
                state.activeTab = "document-readiness";
                state.noticeMessage = "Submit SGAC or MDAC before opening the passport QR bar.";
                state.errorMessage = "";
                render();
                return;
            }
            state.checkInAccepted = true;
            state.passReady = true;
            state.profileQrMode = "precheckin";
            pendingScrollTargetId = "qr-pass-panel";
            openPass(state);
            state.noticeMessage = "Passport pre-check-in pass opened in your profile.";
            state.errorMessage = "";
            render();
            return;
        }

        if (action === "open-smart-gate-pass") {
            state.documentSubmissionStatuses = {
                ...normalizeDocumentSubmissionStatuses(state.documentSubmissionStatuses),
                sgac: "confirmed",
            };
            state.checkInAccepted = true;
            state.passReady = true;
            state.profileQrMode = "precheckin";
            pendingScrollTargetId = "qr-pass-panel";
            openPass(state);
            state.noticeMessage = "Smart-Gate passport QR bar opened in your profile.";
            state.errorMessage = "";
            render();
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
            if (mode === "precheckin" && !hasConfirmedDocumentSubmission(state)) {
                state.activeTab = "document-readiness";
                state.noticeMessage = "Submit SGAC or MDAC before opening the passport QR bar.";
                state.errorMessage = "";
                render();
                return;
            }
            state.profileQrMode = mode ?? "rts";
            pendingScrollTargetId = "qr-pass-panel";
            openPass(state);
            state.noticeMessage = state.profileQrMode === "precheckin"
                ? "Passport pre-check-in pass opened in your profile."
                : "Travel QR pass opened in your profile.";
            state.errorMessage = "";
            render();
            return;
        }

        if (action === "show-profile-pass") {
            if (mode === "precheckin" && !hasConfirmedDocumentSubmission(state)) {
                state.activeTab = "document-readiness";
                state.noticeMessage = "Submit SGAC or MDAC before showing the passport pre-check-in pass.";
                state.errorMessage = "";
                render();
                return;
            }
            state.profileQrMode = mode ?? "rts";
            pendingScrollTargetId = "qr-pass-panel";
            state.noticeMessage = state.profileQrMode === "precheckin"
                ? "Showing passport pre-check-in pass."
                : "Showing travel QR pass.";
            state.errorMessage = "";
            render();
            return;
        }

        if (action === "edit-profile") {
            state.isEditingProfile = true;
            state.profileDraft = {
                displayName: state.profileDetails?.displayName ?? "",
                email: state.profileDetails?.email ?? "",
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
            };
            state.noticeMessage = "";
            state.errorMessage = "";
            render();
            return;
        }

        if (action === "save-profile") {
            state.isEditingProfile = true;
            const useBackend = state.isAuthenticated && state.isBackendConnected;
            const saveProfile = useBackend ? () => apiClient.updateProfile({
                displayName: state.profileDraft?.displayName ?? "",
                email: state.profileDraft?.email ?? "",
            }) : () => saveProfileLocally(state);

            await runRequest("save-profile", saveProfile, {
                successMessage: state.profileDetails?.memberSince ? "Profile saved." : "Profile created.",
                nextTab: "profile",
                syncAfter: useBackend,
            });
            state.isEditingProfile = false;
            render();
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
            if (!state.isAuthenticated || !state.isBackendConnected) {
                return;
            }
            await runRequest("select-driver", () => apiClient.selectCarpoolDriver(driver), {
                successMessage: "Selected carpool driver updated.",
            });
            return;
        }

        if (action === "confirm-train") {
            const useBackend = state.isAuthenticated && state.isBackendConnected;
            state.profileQrMode = "rts";
            await runRequest("confirm-train", useBackend ? () => apiClient.confirmTrainBooking() : () => confirmTrainLocally(state), {
                successMessage: "RTS booking confirmed.",
                nextTab: "booking",
                syncAfter: useBackend,
            });
            return;
        }

        if (action === "confirm-bus") {
            const useBackend = state.isAuthenticated && state.isBackendConnected;
            state.profileQrMode = "bus";
            await runRequest("confirm-bus", useBackend ? () => apiClient.confirmBusBooking() : () => confirmBusLocally(state), {
                successMessage: "Bus booking confirmed.",
                nextTab: "bus-booking",
                syncAfter: useBackend,
            });
            return;
        }

        if (action === "confirm-carpool") {
            state.activeTab = "carpool-pickup";
            state.noticeMessage = "Opening reserved pickup route...";
            state.errorMessage = "";
            render();
            const useBackend = state.isAuthenticated && state.isBackendConnected;
            await runRequest("confirm-carpool", useBackend ? () => apiClient.confirmCarpoolBooking() : () => confirmCarpoolLocally(state), {
                successMessage: "Carpool seat reserved.",
                nextTab: "carpool-pickup",
                syncAfter: useBackend,
            });
            return;
        }

        if (action === "reset-state") {
            const useBackend = state.isAuthenticated && state.isBackendConnected;
            const resetState = useBackend
                ? () => apiClient.resetState()
                : () => resetStateLocally(state);

            await runRequest("reset-state", resetState, {
                successMessage: "Demo data reset. You can replay the booking flow now.",
                nextTab: "explore",
                preserveTab: false,
                syncAfter: useBackend,
            });
        }
    };

    const handleFieldChange = async (field, value) => {
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
            state.noticeMessage = "Destination updated.";
            state.errorMessage = "";
            render();
            if (!state.isAuthenticated || !state.isBackendConnected) {
                return;
            }

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
            if (state.booking.confirmed) {
                state.booking.updatedAt = currentTimestamp();
            }
            state.noticeMessage = "Origin updated.";
            state.errorMessage = "";
            render();
            if (!state.isAuthenticated || !state.isBackendConnected) {
                return;
            }
            await runRequest(field, () => apiClient.updateTrainBooking({ origin: value }), {
                successMessage: "Origin updated.",
            });
            return;
        }

        if (field === "bus-origin") {
            state.busBooking.origin = value;
            if (state.busBooking.confirmed) {
                state.busBooking.updatedAt = currentTimestamp();
            }
            state.noticeMessage = "Bus origin updated.";
            state.errorMessage = "";
            render();
            if (!state.isAuthenticated || !state.isBackendConnected) {
                return;
            }
            await runRequest(field, () => apiClient.updateBusBooking({ origin: value }), {
                successMessage: "Bus origin updated.",
            });
            return;
        }

        if (field === "train-time") {
            state.booking.departureTime = value;
            syncDerivedTimes(state);
            if (state.booking.confirmed) {
                state.booking.updatedAt = currentTimestamp();
            }
            state.noticeMessage = "RTS departure time updated.";
            state.errorMessage = "";
            render();
            if (!state.isAuthenticated || !state.isBackendConnected) {
                return;
            }
            await runRequest(field, () => apiClient.updateTrainBooking({ departureTime: value }), {
                successMessage: "RTS departure time updated.",
            });
            return;
        }

        if (field === "bus-time") {
            state.busBooking.departureTime = value;
            syncDerivedTimes(state);
            if (state.busBooking.confirmed) {
                state.busBooking.updatedAt = currentTimestamp();
            }
            state.noticeMessage = "Bus departure time updated.";
            state.errorMessage = "";
            render();
            if (!state.isAuthenticated || !state.isBackendConnected) {
                return;
            }
            await runRequest(field, () => apiClient.updateBusBooking({ departureTime: value }), {
                successMessage: "Bus departure time updated.",
            });
            return;
        }

        if (field === "train-payment") {
            state.booking.paymentMethod = value;
            if (state.booking.confirmed) {
                state.booking.paymentStatus = `Charged to ${value}`;
                state.booking.updatedAt = currentTimestamp();
            }
            state.noticeMessage = "RTS payment method updated.";
            state.errorMessage = "";
            render();
            if (!state.isAuthenticated || !state.isBackendConnected) {
                return;
            }
            await runRequest(field, () => apiClient.updateTrainBooking({ paymentMethod: value }), {
                successMessage: "RTS payment method updated.",
            });
            return;
        }

        if (field === "bus-payment") {
            state.busBooking.paymentMethod = value;
            if (state.busBooking.confirmed) {
                state.busBooking.paymentStatus = `Charged to ${value}`;
                state.busBooking.updatedAt = currentTimestamp();
            }
            state.noticeMessage = "Bus payment method updated.";
            state.errorMessage = "";
            render();
            if (!state.isAuthenticated || !state.isBackendConnected) {
                return;
            }
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
            if (state.carpoolBooking.confirmed) {
                state.carpoolBooking.paymentStatus = `Charge queued for ${value}`;
                state.carpoolBooking.updatedAt = currentTimestamp();
            }
            state.noticeMessage = "Carpool payment method updated.";
            state.errorMessage = "";
            render();
            if (!state.isAuthenticated || !state.isBackendConnected) {
                return;
            }
            await runRequest(field, () => apiClient.updateCarpoolPayment(value), {
                successMessage: "Carpool payment method updated.",
            });
        }
    };

    root.addEventListener("click", async (event) => {
        const avatarTrigger = event.target.closest("#profile-avatar-trigger");
        if (avatarTrigger) {
            const uploadInput = document.getElementById("profile-photo-upload");
            if (uploadInput) {
                uploadInput.click();
            }
            return;
        }

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
        if (event.target.id === "profile-photo-upload") {
            const file = event.target.files?.[0];
            if (!file) return;

            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                state.errorMessage = "Choose a JPG, PNG, or WebP image for your profile picture.";
                render();
                event.target.value = "";
                return;
            }

            if (file.size > 8 * 1024 * 1024) {
                state.errorMessage = "Choose a profile picture smaller than 8 MB.";
                render();
                event.target.value = "";
                return;
            }

            if (!state.authUserId) {
                state.errorMessage = "Firebase sign-in is still starting. Try uploading again in a moment.";
                render();
                return;
            }

            const previousPhotoURL = state.profileDetails?.photoURL ?? null;
            const previewUrl = URL.createObjectURL(file);
            state.profileDetails = {
                ...state.profileDetails,
                photoURL: previewUrl,
            };
            state.noticeMessage = "Preview ready. Optimizing photo before upload...";
            state.errorMessage = "";
            render();

            await runRequest("upload-avatar", async () => {
                const optimizedFile = await compressProfilePhoto(file);
                const downloadURL = await uploadProfilePicture(state.authUserId, optimizedFile);
                if (state.profileDetails) {
                    state.profileDetails.photoURL = downloadURL;
                }
                if (state.isBackendConnected) {
                    await apiClient.updateProfile({ photoURL: downloadURL });
                }
            }, {
                successMessage: state.isBackendConnected
                    ? "Profile picture updated."
                    : "Profile picture uploaded. Backend sync will update when the API is connected.",
                nextTab: "profile",
                preserveTab: true,
                syncAfter: state.isBackendConnected,
            });

            if (state.errorMessage && previousPhotoURL !== previewUrl) {
                state.profileDetails = {
                    ...state.profileDetails,
                    photoURL: previousPhotoURL,
                };
                render();
            }

            URL.revokeObjectURL(previewUrl);

            // Reset the input so it can trigger change event again if the same file is selected
            event.target.value = "";
            return;
        }

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
