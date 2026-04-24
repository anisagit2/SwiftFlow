import { parseJsonBody } from "../http/request.js";
import { sendJson } from "../http/response.js";
import { generateExploreSuggestions } from "../ai/geminiService.js";
import { enqueueBookingLifecycleTasks } from "../services/taskScheduler.js";
import { translateAlertDetails, translateExploreSuggestions, translateSnapshot } from "../services/translationService.js";
import {
    ensureInternalRequest,
    ensureMethod,
    ensureUser,
    overview,
    sendMethodNotAllowed,
    withBadRequest,
} from "./utils.js";

export const handlePublicRoutes = async ({ pathname, request, response }) => {
    if (pathname === "/health") {
        if (!ensureMethod(request, response, "GET")) {
            return true;
        }

        sendJson(response, 200, { status: "ok", service: "swiftflow-backend" }, request);
        return true;
    }

    if (pathname === "/api") {
        if (!ensureMethod(request, response, "GET")) {
            return true;
        }

        sendJson(response, 200, overview, request);
        return true;
    }

    return false;
};

export const handleStateRoutes = async ({ pathname, request, response, store, user, preferredLanguage }) => {
    if (pathname === "/api/state") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "GET")) {
            return true;
        }

        sendJson(response, 200, await translateSnapshot(await store.getState(user), preferredLanguage), request);
        return true;
    }

    if (pathname === "/api/state/reset") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "POST")) {
            return true;
        }

        sendJson(response, 200, await store.resetState(user), request);
        return true;
    }

    if (pathname === "/api/options") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "GET")) {
            return true;
        }

        sendJson(response, 200, (await store.getSnapshot(user)).options, request);
        return true;
    }

    if (pathname === "/api/explore") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "GET")) {
            return true;
        }

        const exploreData = (await store.getSnapshot(user)).explore;
        const aiSuggestions = await generateExploreSuggestions(exploreData.booking.destination);
        exploreData.aiSuggestions = await translateExploreSuggestions(aiSuggestions, preferredLanguage);
        exploreData.language = preferredLanguage;

        sendJson(response, 200, exploreData, request);
        return true;
    }

    if (pathname === "/api/trips/history") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "GET")) {
            return true;
        }

        sendJson(response, 200, await store.getTripHistory(user), request);
        return true;
    }

    return false;
};

export const handleBookingRoutes = async ({ pathname, request, response, store, user }) => {
    if (pathname === "/api/bookings/train") {
        if (!ensureUser(user, response, request)) {
            return true;
        }

        if (request.method === "GET") {
            sendJson(response, 200, (await store.getSnapshot(user)).bookings.train, request);
            return true;
        }

        if (request.method === "PATCH") {
            await withBadRequest(request, response, async () => {
                const body = await parseJsonBody(request);
                sendJson(response, 200, await store.updateTrainBooking(user, body), request);
            });
            return true;
        }

        sendMethodNotAllowed(response, request);
        return true;
    }

    if (pathname === "/api/bookings/train/confirm") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "POST")) {
            return true;
        }

        const result = await store.confirmTrainBooking(user);
        const scheduledTasks = await enqueueBookingLifecycleTasks({
            userId: user.userId,
            bookingType: "train",
            booking: result.booking,
        });
        sendJson(response, 200, { ...result, scheduledTasks }, request);
        return true;
    }

    if (pathname === "/api/bookings/bus") {
        if (!ensureUser(user, response, request)) {
            return true;
        }

        if (request.method === "GET") {
            sendJson(response, 200, (await store.getSnapshot(user)).bookings.bus, request);
            return true;
        }

        if (request.method === "PATCH") {
            await withBadRequest(request, response, async () => {
                const body = await parseJsonBody(request);
                sendJson(response, 200, await store.updateBusBooking(user, body), request);
            });
            return true;
        }

        sendMethodNotAllowed(response, request);
        return true;
    }

    if (pathname === "/api/bookings/bus/confirm") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "POST")) {
            return true;
        }

        const result = await store.confirmBusBooking(user);
        const scheduledTasks = await enqueueBookingLifecycleTasks({
            userId: user.userId,
            bookingType: "bus",
            booking: result.booking,
        });
        sendJson(response, 200, { ...result, scheduledTasks }, request);
        return true;
    }

    if (pathname === "/api/bookings/carpool") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "GET")) {
            return true;
        }

        sendJson(response, 200, await store.getCarpoolBooking(user), request);
        return true;
    }

    if (pathname === "/api/bookings/carpool/select-driver") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "PATCH")) {
            return true;
        }

        await withBadRequest(request, response, async () => {
            const body = await parseJsonBody(request);
            sendJson(response, 200, await store.selectCarpoolDriver(user, body.driverId), request);
        });
        return true;
    }

    if (pathname === "/api/bookings/carpool/payment") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "PATCH")) {
            return true;
        }

        await withBadRequest(request, response, async () => {
            const body = await parseJsonBody(request);
            sendJson(response, 200, await store.updateCarpoolPayment(user, body.paymentMethod), request);
        });
        return true;
    }

    if (pathname === "/api/bookings/carpool/confirm") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "POST")) {
            return true;
        }

        sendJson(response, 200, await store.confirmCarpoolBooking(user), request);
        return true;
    }

    return false;
};

export const handleExperienceRoutes = async ({ pathname, request, response, store, user, preferredLanguage }) => {
    if (pathname === "/api/check-in") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "POST")) {
            return true;
        }

        sendJson(response, 200, await store.activateCheckIn(user), request);
        return true;
    }

    if (pathname === "/api/alerts/accept") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "POST")) {
            return true;
        }

        const result = await store.acceptAlert(user);
        sendJson(response, 200, {
            ...result,
            alertDetails: await translateAlertDetails(result.alertDetails, preferredLanguage),
        }, request);
        return true;
    }

    if (pathname === "/api/credits") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "GET")) {
            return true;
        }

        sendJson(response, 200, await store.getCredits(user), request);
        return true;
    }

    if (pathname === "/api/rewards") {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "GET")) {
            return true;
        }

        sendJson(response, 200, await store.getRewards(user), request);
        return true;
    }

    const rewardMatch = pathname.match(/^\/api\/rewards\/([^/]+)\/redeem$/);
    if (rewardMatch) {
        if (!ensureUser(user, response, request) || !ensureMethod(request, response, "POST")) {
            return true;
        }

        await withBadRequest(request, response, async () => {
            sendJson(response, 200, await store.redeemReward(user, rewardMatch[1]), request);
        });
        return true;
    }

    if (pathname === "/api/profile") {
        if (!ensureUser(user, response, request)) {
            return true;
        }

        if (request.method === "GET") {
            sendJson(response, 200, await store.getProfile(user), request);
            return true;
        }

        if (request.method === "PATCH") {
            await withBadRequest(request, response, async () => {
                const body = await parseJsonBody(request);
                sendJson(response, 200, await store.updateProfile(user, body), request);
            });
            return true;
        }

        sendMethodNotAllowed(response, request);
        return true;
    }

    return false;
};

export const handleInternalRoutes = async ({ pathname, request, response, store }) => {
    if (pathname === "/api/cron/expire-tickets") {
        if (!ensureInternalRequest(request, response) || !ensureMethod(request, response, "POST")) {
            return true;
        }

        sendJson(response, 200, await store.expirePastTickets(), request);
        return true;
    }

    if (pathname === "/api/tasks/expire-ticket") {
        if (!ensureInternalRequest(request, response) || !ensureMethod(request, response, "POST")) {
            return true;
        }

        await withBadRequest(request, response, async () => {
            const body = await parseJsonBody(request);
            sendJson(response, 200, await store.expireTicket({ userId: body.userId }, body.bookingType, body), request);
        });
        return true;
    }

    if (pathname === "/api/tasks/send-trip-reminder") {
        if (!ensureInternalRequest(request, response) || !ensureMethod(request, response, "POST")) {
            return true;
        }

        await withBadRequest(request, response, async () => {
            const body = await parseJsonBody(request);
            sendJson(response, 200, await store.recordTripReminder({ userId: body.userId }, body), request);
        });
        return true;
    }

    return false;
};
