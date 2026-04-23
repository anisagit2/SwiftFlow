import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
    const storage = getStorage(app);
    
    // Create a reference to the file path in storage
    const fileRef = ref(storage, `users/${userId}/profile.jpg`);
    
    // Upload the file
    await uploadBytes(fileRef, file);
    
    // Get the public download URL
    return getDownloadURL(fileRef);
};
