import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const normalizeValue = (value) => {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().replace(/^['"]|['"]$/g, "");
};

const projectId = normalizeValue(import.meta.env.VITE_FIREBASE_PROJECT_ID);
const configuredStorageBucket = normalizeValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);

const firebaseConfig = {
    apiKey: normalizeValue(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: normalizeValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId,
    storageBucket: configuredStorageBucket || `${projectId}.appspot.com`,
    appId: normalizeValue(import.meta.env.VITE_FIREBASE_APP_ID),
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

let authInstance = null;

const buildSession = (user) => ({
    enabled: true,
    mode: user?.isAnonymous ? "anonymous" : "authenticated",
    userId: user?.uid ?? null,
    displayName: user?.displayName ?? user?.email ?? "Guest profile",
    email: user?.email ?? null,
    photoURL: user?.photoURL ?? null,
});

const getFirebaseAuth = () => {
    if (!hasFirebaseConfig) {
        return null;
    }

    const app = getApps()[0] ?? initializeApp(firebaseConfig);
    authInstance = authInstance ?? getAuth(app);
    return authInstance;
};

const ensureFirebaseUser = async (auth) => {
    if (!auth) {
        throw new Error("Firebase is not configured.");
    }

    if (typeof auth.authStateReady === "function") {
        await auth.authStateReady();
    }

    if (auth.currentUser) {
        return auth.currentUser;
    }

    try {
        const result = await signInAnonymously(auth);
        return result.user;
    } catch (error) {
        if (error?.code === "auth/operation-not-allowed") {
            throw new Error("Enable Anonymous sign-in in Firebase Authentication before uploading profile photos.");
        }

        throw new Error("Firebase sign-in failed. Check Authentication settings for this project.");
    }
};

const mapUploadError = (error) => {
    if (error?.code === "storage/unauthorized") {
        return "Firebase Storage denied the upload. Check your Storage rules for this signed-in user.";
    }

    if (error?.code === "storage/bucket-not-found") {
        return "Firebase Storage bucket was not found. Set VITE_FIREBASE_STORAGE_BUCKET to the correct bucket name.";
    }

    if (error?.code === "storage/invalid-default-bucket") {
        return "Firebase Storage bucket is misconfigured. Update VITE_FIREBASE_STORAGE_BUCKET in the frontend environment.";
    }

    if (error?.code === "storage/retry-limit-exceeded") {
        return "Upload timed out. Try a smaller image or check your network connection.";
    }

    return error instanceof Error ? error.message : "Profile picture upload failed.";
};

const buildStorageCandidates = () => {
    const candidates = [
        configuredStorageBucket,
        `${projectId}.appspot.com`,
        `${projectId}.firebasestorage.app`,
    ]
        .map((candidate) => normalizeValue(candidate).replace(/^gs:\/\//, ""))
        .filter(Boolean);

    return [...new Set(candidates)];
};

export const initializeFirebaseSession = async () => {
    const auth = getFirebaseAuth();

    if (!auth) {
        return {
            enabled: false,
            mode: "disabled",
        };
    }

    if (typeof auth.authStateReady === "function") {
        await auth.authStateReady();
    }

    if (auth.currentUser) {
        return buildSession(auth.currentUser);
    }

    const result = await signInAnonymously(auth);
    return buildSession(result.user);
};

export const getFirebaseIdToken = async () => {
    const auth = getFirebaseAuth();

    if (!auth?.currentUser) {
        return null;
    }

    return auth.currentUser.getIdToken();
};

export const uploadProfilePicture = async (userId, file) => {
    if (!hasFirebaseConfig) {
        throw new Error("Firebase is not configured.");
    }

    const app = getApps()[0] ?? initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const user = await ensureFirebaseUser(auth);
    const ownerId = userId || user.uid;
    const bucketCandidates = buildStorageCandidates();
    let lastError = null;

    for (const bucketName of bucketCandidates) {
        try {
            const storage = getStorage(app, `gs://${bucketName}`);
            const fileRef = ref(storage, `users/${ownerId}/profile.jpg`);
            await uploadBytes(fileRef, file, {
                cacheControl: "public,max-age=3600",
                contentType: file.type || "image/webp",
            });
            return await getDownloadURL(fileRef);
        } catch (error) {
            lastError = error;
        }
    }

    throw new Error(mapUploadError(lastError));
};
