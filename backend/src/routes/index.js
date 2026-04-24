import { getPreferredLanguage } from "../services/language.js";
import { getUrl } from "../http/request.js";
import {
    handleBookingRoutes,
    handleExperienceRoutes,
    handleInternalRoutes,
    handlePublicRoutes,
    handleStateRoutes,
} from "./handlers.js";

export const routeRequest = async (request, response, store, requestContext) => {
    const url = getUrl(request);
    const { pathname } = url;
    const user = requestContext.user;
    const preferredLanguage = getPreferredLanguage(request);

    const routeContext = {
        pathname,
        request,
        response,
        store,
        user,
        preferredLanguage,
    };

    if (await handlePublicRoutes(routeContext)) return true;
    if (await handleStateRoutes(routeContext)) return true;
    if (await handleBookingRoutes(routeContext)) return true;
    if (await handleExperienceRoutes(routeContext)) return true;
    if (await handleInternalRoutes(routeContext)) return true;

    return false;
};
