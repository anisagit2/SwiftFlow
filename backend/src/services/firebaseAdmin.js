import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { env } from "../config/env.js";

const app = getApps()[0] ?? initializeApp({
    credential: applicationDefault(),
    projectId: env.firebaseProjectId,
});

export const auth = getAuth(app);
export const db = getFirestore(app);
