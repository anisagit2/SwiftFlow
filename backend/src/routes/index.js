import { getUrl, parseJsonBody } from "../http/request.js";
import { sendJson } from "../http/response.js";
import { generateExploreSuggestions } from "../ai/geminiService.js";

const methodNotAllowed = (response, request) => {
    sendJson(response, 405, { error: "Method not allowed" }, request);
};

const badRequest = (response, error, request) => {
    sendJson(response, 400, {
        error: "Bad request",
        message: error instanceof Error ? error.message : "Invalid request.",
    }, request);
};

const unauthorized = (response, request) => {
    sendJson(response, 401, {
        error: "Unauthorized",
        message: "Sign in is required before calling this API.",
    }, request);
};

const overview = {
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
    ],
};

export const routeRequest = async (request, response, store, requestContext) => {
    const url = getUrl(request);
    const { pathname } = url;
    const user = requestContext.user;

    if (pathname === "/health") {
        if (request.method !== "GET") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, { status: "ok", service: "swiftflow-backend" }, request);
        return true;
    }

    if (pathname === "/api") {
        if (request.method !== "GET") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, overview, request);
        return true;
    }

    if (pathname === "/api/state") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "GET") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, await store.getState(user), request);
        return true;
    }

    if (pathname === "/api/state/reset") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "POST") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, await store.resetState(user), request);
        return true;
    }

    if (pathname === "/api/options") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "GET") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, (await store.getSnapshot(user)).options, request);
        return true;
    }

    if (pathname === "/api/explore") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "GET") {
            methodNotAllowed(response, request);
            return true;
        }

        const exploreData = (await store.getSnapshot(user)).explore;
        const aiSuggestions = await generateExploreSuggestions(exploreData.booking.destination);
        exploreData.aiSuggestions = aiSuggestions;
        
        sendJson(response, 200, exploreData, request);
        return true;
    }

    if (pathname === "/api/trips/history") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "GET") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, await store.getTripHistory(user), request);
        return true;
    }

    if (pathname === "/api/bookings/train") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method === "GET") {
            sendJson(response, 200, (await store.getSnapshot(user)).bookings.train, request);
            return true;
        }

        if (request.method === "PATCH") {
            try {
                const body = await parseJsonBody(request);
                sendJson(response, 200, await store.updateTrainBooking(user, body), request);
            } catch (error) {
                badRequest(response, error, request);
            }
            return true;
        }

        methodNotAllowed(response, request);
        return true;
    }

    if (pathname === "/api/bookings/train/confirm") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "POST") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, await store.confirmTrainBooking(user), request);
        return true;
    }

    if (pathname === "/api/bookings/bus") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method === "GET") {
            sendJson(response, 200, (await store.getSnapshot(user)).bookings.bus, request);
            return true;
        }

        if (request.method === "PATCH") {
            try {
                const body = await parseJsonBody(request);
                sendJson(response, 200, await store.updateBusBooking(user, body), request);
            } catch (error) {
                badRequest(response, error, request);
            }
            return true;
        }

        methodNotAllowed(response, request);
        return true;
    }

    if (pathname === "/api/bookings/bus/confirm") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "POST") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, await store.confirmBusBooking(user), request);
        return true;
    }

    if (pathname === "/api/bookings/carpool") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "GET") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, await store.getCarpoolBooking(user), request);
        return true;
    }

    if (pathname === "/api/bookings/carpool/select-driver") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "PATCH") {
            methodNotAllowed(response, request);
            return true;
        }

        try {
            const body = await parseJsonBody(request);
            sendJson(response, 200, await store.selectCarpoolDriver(user, body.driverId), request);
        } catch (error) {
            badRequest(response, error, request);
        }
        return true;
    }

    if (pathname === "/api/bookings/carpool/payment") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "PATCH") {
            methodNotAllowed(response, request);
            return true;
        }

        try {
            const body = await parseJsonBody(request);
            sendJson(response, 200, await store.updateCarpoolPayment(user, body.paymentMethod), request);
        } catch (error) {
            badRequest(response, error, request);
        }
        return true;
    }

    if (pathname === "/api/bookings/carpool/confirm") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "POST") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, await store.confirmCarpoolBooking(user), request);
        return true;
    }

    if (pathname === "/api/check-in") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "POST") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, await store.activateCheckIn(user), request);
        return true;
    }

    if (pathname === "/api/alerts/accept") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "POST") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, await store.acceptAlert(user), request);
        return true;
    }

    if (pathname === "/api/credits") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "GET") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, await store.getCredits(user), request);
        return true;
    }

    if (pathname === "/api/rewards") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "GET") {
            methodNotAllowed(response, request);
            return true;
        }

        sendJson(response, 200, await store.getRewards(user), request);
        return true;
    }

    const rewardMatch = pathname.match(/^\/api\/rewards\/([^/]+)\/redeem$/);

    if (rewardMatch) {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method !== "POST") {
            methodNotAllowed(response, request);
            return true;
        }

        try {
            sendJson(response, 200, await store.redeemReward(user, rewardMatch[1]), request);
        } catch (error) {
            badRequest(response, error, request);
        }
        return true;
    }

    if (pathname === "/api/profile") {
        if (!user) {
            unauthorized(response, request);
            return true;
        }

        if (request.method === "GET") {
            sendJson(response, 200, await store.getProfile(user), request);
            return true;
        }

        if (request.method === "PATCH") {
            try {
                const body = await parseJsonBody(request);
                sendJson(response, 200, await store.updateProfile(user, body), request);
            } catch (error) {
                badRequest(response, error, request);
            }
            return true;
        }

        methodNotAllowed(response, request);
        return true;
    }

    return false;
};
