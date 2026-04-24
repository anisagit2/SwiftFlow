import { sendJson } from "../http/response.js";
import { isInternalRequestAuthorized } from "../services/internalAuth.js";

export const overview = {
    message: "SwiftFlow backend is ready for the current frontend features.",
    endpoints: [
        "GET /health",
        "GET /api",
        "GET /api/state",
        "POST /api/state/reset",
        "GET /api/options",
        "GET /api/explore",
        "GET /api/trips/history",
        "GET /api/bookings/train",
        "PATCH /api/bookings/train",
        "POST /api/bookings/train/confirm",
        "GET /api/bookings/bus",
        "PATCH /api/bookings/bus",
        "POST /api/bookings/bus/confirm",
        "GET /api/bookings/carpool",
        "PATCH /api/bookings/carpool/select-driver",
        "PATCH /api/bookings/carpool/payment",
        "POST /api/bookings/carpool/confirm",
        "POST /api/check-in",
        "POST /api/alerts/accept",
        "GET /api/credits",
        "GET /api/rewards",
        "POST /api/rewards/:rewardId/redeem",
        "GET /api/profile",
        "PATCH /api/profile",
        "POST /api/cron/expire-tickets",
        "POST /api/tasks/expire-ticket",
        "POST /api/tasks/send-trip-reminder",
    ],
};

export const sendMethodNotAllowed = (response, request) => {
    sendJson(response, 405, { error: "Method not allowed" }, request);
};

export const sendBadRequest = (response, error, request) => {
    sendJson(response, 400, {
        error: "Bad request",
        message: error instanceof Error ? error.message : "Invalid request.",
    }, request);
};

export const sendUnauthorized = (response, request) => {
    sendJson(response, 401, {
        error: "Unauthorized",
        message: "Sign in is required before calling this API.",
    }, request);
};

export const ensureMethod = (request, response, method) => {
    if (request.method === method) {
        return true;
    }

    sendMethodNotAllowed(response, request);
    return false;
};

export const ensureUser = (user, response, request) => {
    if (user) {
        return true;
    }

    sendUnauthorized(response, request);
    return false;
};

export const ensureInternalRequest = (request, response) => {
    if (isInternalRequestAuthorized(request)) {
        return true;
    }

    sendUnauthorized(response, request);
    return false;
};

export const withBadRequest = async (request, response, handler) => {
    try {
        await handler();
    } catch (error) {
        sendBadRequest(response, error, request);
    }
};
