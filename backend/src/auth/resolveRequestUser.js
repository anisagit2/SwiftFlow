import { auth } from "../services/firebaseAdmin.js";
import { env } from "../config/env.js";

const getBearerToken = (request) => {
    const header = request.headers.authorization;

    if (!header) {
        return null;
    }

    const [scheme, token] = header.split(" ");

    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return null;
    }

    return token;
};

export const resolveRequestUser = async (request) => {
    const token = getBearerToken(request);

    if (!token) {
        if (env.allowUnauthenticatedDev) {
            return {
                userId: env.devUserId,
                email: null,
                displayName: "Local Dev User",
                isDevelopmentFallback: true,
            };
        }

        return null;
    }

    const decodedToken = await auth.verifyIdToken(token);

    return {
        userId: decodedToken.uid,
        email: decodedToken.email ?? null,
        displayName: decodedToken.name ?? decodedToken.email ?? "SwiftFlow User",
        photoURL: decodedToken.picture ?? null,
        isDevelopmentFallback: false,
    };
};
