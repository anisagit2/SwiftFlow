import http from "node:http";

import { resolveRequestUser } from "./auth/resolveRequestUser.js";
import { env } from "./config/env.js";
import { buildCorsHeaders, sendJson } from "./http/response.js";
import { routeRequest } from "./routes/index.js";
import { createAppStore } from "./store/firebaseStore.js";

const store = createAppStore();

const server = http.createServer(async (request, response) => {
    if (request.method === "OPTIONS") {
        response.writeHead(204, buildCorsHeaders(request));
        response.end();
        return;
    }

    try {
        const user = await resolveRequestUser(request);
        const handled = await routeRequest(request, response, store, { user });

        if (!handled) {
            sendJson(response, 404, {
                error: "Not found",
                message: `No backend route matches ${request.method} ${request.url}`,
            }, request);
        }
    } catch (error) {
        sendJson(response, 500, {
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error",
        }, request);
    }
});

server.listen(env.port, "0.0.0.0", () => {
    console.log(`SwiftFlow backend listening on http://0.0.0.0:${env.port}`);
});
