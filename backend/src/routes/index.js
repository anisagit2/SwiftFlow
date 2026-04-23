import { getUrl, parseJsonBody } from "../http/request.js";
import { sendJson } from "../http/response.js";
import { generateExploreSuggestions } from "../ai/geminiService.js";

const methodNotAllowed = (response) => {
    sendJson(response, 405, { error: "Method not allowed" });
};

const badRequest = (response, error) => {
    sendJson(response, 400, {
        error: "Bad request",
        message: error instanceof Error ? error.message : "Invalid request.",
    });
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
    ],
};

export const routeRequest = async (request, response, store) => {
    const url = getUrl(request);
    const { pathname } = url;

    if (pathname === "/health") {
        if (request.method !== "GET") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, { status: "ok", service: "swiftflow-backend" });
        return true;
    }

    if (pathname === "/api") {
        if (request.method !== "GET") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, overview);
        return true;
    }

    if (pathname === "/api/state") {
        if (request.method !== "GET") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, await store.getState());
        return true;
    }

    if (pathname === "/api/state/reset") {
        if (request.method !== "POST") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, await store.resetState());
        return true;
    }

    if (pathname === "/api/options") {
        if (request.method !== "GET") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, (await store.getSnapshot()).options);
        return true;
    }

    if (pathname === "/api/explore") {
        if (request.method !== "GET") {
            methodNotAllowed(response);
            return true;
        }

        const exploreData = (await store.getSnapshot()).explore;
        const aiSuggestions = await generateExploreSuggestions(exploreData.booking.destination);
        exploreData.aiSuggestions = aiSuggestions;
        
        sendJson(response, 200, exploreData);
        return true;
    }

    if (pathname === "/api/bookings/train") {
        if (request.method === "GET") {
            sendJson(response, 200, (await store.getSnapshot()).bookings.train);
            return true;
        }

        if (request.method === "PATCH") {
            try {
                const body = await parseJsonBody(request);
                sendJson(response, 200, await store.updateTrainBooking(body));
            } catch (error) {
                badRequest(response, error);
            }
            return true;
        }

        methodNotAllowed(response);
        return true;
    }

    if (pathname === "/api/bookings/train/confirm") {
        if (request.method !== "POST") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, await store.confirmTrainBooking());
        return true;
    }

    if (pathname === "/api/bookings/bus") {
        if (request.method === "GET") {
            sendJson(response, 200, (await store.getSnapshot()).bookings.bus);
            return true;
        }

        if (request.method === "PATCH") {
            try {
                const body = await parseJsonBody(request);
                sendJson(response, 200, await store.updateBusBooking(body));
            } catch (error) {
                badRequest(response, error);
            }
            return true;
        }

        methodNotAllowed(response);
        return true;
    }

    if (pathname === "/api/bookings/bus/confirm") {
        if (request.method !== "POST") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, await store.confirmBusBooking());
        return true;
    }

    if (pathname === "/api/bookings/carpool") {
        if (request.method !== "GET") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, await store.getCarpoolBooking());
        return true;
    }

    if (pathname === "/api/bookings/carpool/select-driver") {
        if (request.method !== "PATCH") {
            methodNotAllowed(response);
            return true;
        }

        try {
            const body = await parseJsonBody(request);
            sendJson(response, 200, await store.selectCarpoolDriver(body.driverId));
        } catch (error) {
            badRequest(response, error);
        }
        return true;
    }

    if (pathname === "/api/bookings/carpool/payment") {
        if (request.method !== "PATCH") {
            methodNotAllowed(response);
            return true;
        }

        try {
            const body = await parseJsonBody(request);
            sendJson(response, 200, await store.updateCarpoolPayment(body.paymentMethod));
        } catch (error) {
            badRequest(response, error);
        }
        return true;
    }

    if (pathname === "/api/bookings/carpool/confirm") {
        if (request.method !== "POST") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, await store.confirmCarpoolBooking());
        return true;
    }

    if (pathname === "/api/check-in") {
        if (request.method !== "POST") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, await store.activateCheckIn());
        return true;
    }

    if (pathname === "/api/alerts/accept") {
        if (request.method !== "POST") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, await store.acceptAlert());
        return true;
    }

    if (pathname === "/api/credits") {
        if (request.method !== "GET") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, await store.getCredits());
        return true;
    }

    if (pathname === "/api/rewards") {
        if (request.method !== "GET") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, await store.getRewards());
        return true;
    }

    const rewardMatch = pathname.match(/^\/api\/rewards\/([^/]+)\/redeem$/);

    if (rewardMatch) {
        if (request.method !== "POST") {
            methodNotAllowed(response);
            return true;
        }

        try {
            sendJson(response, 200, await store.redeemReward(rewardMatch[1]));
        } catch (error) {
            badRequest(response, error);
        }
        return true;
    }

    if (pathname === "/api/profile") {
        if (request.method !== "GET") {
            methodNotAllowed(response);
            return true;
        }

        sendJson(response, 200, await store.getProfile());
        return true;
    }

    return false;
};
