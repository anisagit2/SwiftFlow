const parseBoolean = (value, fallback = false) => {
    if (value === undefined) {
        return fallback;
    }

    return value === "true";
};

export const env = {
    port: Number(process.env.PORT) || 3001,
    googleCloudProjectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || "personal-claw-1",
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || "personal-claw-1",
    vertexAiLocation: process.env.VERTEX_AI_LOCATION || "us-central1",
    geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    allowUnauthenticatedDev: parseBoolean(process.env.ALLOW_UNAUTHENTICATED_DEV, false),
    devUserId: process.env.DEV_USER_ID || "local-dev-user",
};
