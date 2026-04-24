export const buildConfirmationCode = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const currentTimestamp = () => new Date().toISOString();

export const delay = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export const createDocumentSubmissionStatuses = () => ({
    sgac: "idle",
    mdac: "idle",
});

export const normalizeDocumentSubmissionStatuses = (statuses = {}) => ({
    ...createDocumentSubmissionStatuses(),
    ...statuses,
});

export const hasConfirmedDocumentSubmission = (appState) => Object.values(appState.documentSubmissionStatuses ?? {})
    .includes("confirmed");

export const compressProfilePhoto = (file) => new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.addEventListener("load", () => {
        const maxSize = 512;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
                reject(new Error("Unable to process profile picture."));
                return;
            }

            resolve(new File([blob], "profile-picture.webp", { type: "image/webp" }));
        }, "image/webp", 0.82);
    }, { once: true });

    image.addEventListener("error", () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to read profile picture."));
    }, { once: true });

    image.src = objectUrl;
});
