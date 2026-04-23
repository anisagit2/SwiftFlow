import { env } from "../config/env.js";

export const isInternalRequestAuthorized = (request) => {
    if (!env.internalTaskSecret) {
        return env.allowUnauthenticatedDev;
    }

    return request.headers["x-swiftflow-task-secret"] === env.internalTaskSecret;
};
