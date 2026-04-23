import http from "node:http";

import { createAppStore } from "./store/appStore.js";
import { sendJson } from "./http/response.js";
import { routeRequest } from "./routes/index.js";

const PORT = Number(process.env.PORT) || 3001;
const store = createAppStore();

const server = http.createServer(async (request, response) => {
    if (request.method === "OPTIONS") {
        response.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        });
        response.end();
        return;
    }

    try {
        const handled = await routeRequest(request, response, store);

        if (!handled) {
            sendJson(response, 404, {
                error: "Not found",
                message: `No backend route matches ${request.method} ${request.url}`,
            });
        }
    } catch (error) {
        sendJson(response, 500, {
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`SwiftFlow backend listening on http://0.0.0.0:${PORT}`);
});
