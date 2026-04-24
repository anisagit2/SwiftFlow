const parseBoolean = (value, fallback = false) => {
    if (value === undefined) {
        return fallback;
    }

    return value === "true";
};

export const env = {
    port: Number(process.env.PORT) || 3001,
    googleCloudProjectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || "swiftflow-494302",
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || "swiftflow-72f6c",
    vertexAiLocation: process.env.VERTEX_AI_LOCATION || "us-central1",
    geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    translationEnabled: parseBoolean(process.env.TRANSLATION_ENABLED, true),
    translationFallbackLanguage: process.env.TRANSLATION_FALLBACK_LANGUAGE || "en",
    backendBaseUrl: process.env.BACKEND_BASE_URL || "",
    internalTaskSecret: process.env.INTERNAL_TASK_SECRET || "",
    cloudTasksLocation: process.env.CLOUD_TASKS_LOCATION || process.env.GOOGLE_CLOUD_REGION || "us-central1",
    cloudTasksQueue: process.env.CLOUD_TASKS_QUEUE || "",
    taskInvokerServiceAccount: process.env.TASK_INVOKER_SERVICE_ACCOUNT || "",
    allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    allowUnauthenticatedDev: parseBoolean(process.env.ALLOW_UNAUTHENTICATED_DEV, false),
    devUserId: process.env.DEV_USER_ID || "local-dev-user",
};
