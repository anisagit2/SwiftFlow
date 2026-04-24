import { apiClient } from "../api/client.js";
import { compressProfilePhoto } from "./helpers.js";
import { uploadProfilePicture } from "../lib/firebase.js";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const restorePreviousPhoto = (state, previousPhotoURL) => {
    state.profileDetails = {
        ...state.profileDetails,
        photoURL: previousPhotoURL,
    };
};

export const handleProfilePhotoUpload = async ({ state, render, runRequest }, input) => {
    const file = input.files?.[0];
    if (!file) {
        return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
        state.errorMessage = "Choose a JPG, PNG, or WebP image for your profile picture.";
        render();
        input.value = "";
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        state.errorMessage = "Choose a profile picture smaller than 8 MB.";
        render();
        input.value = "";
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

    try {
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
            restorePreviousPhoto(state, previousPhotoURL);
            render();
        }
    } finally {
        URL.revokeObjectURL(previewUrl);
        input.value = "";
    }
};
