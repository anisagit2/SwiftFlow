import http from "node:http";

const PORT = Number(process.env.PORT) || 3001;

const sendJson = (response, statusCode, payload) => {
    response.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end(JSON.stringify(payload));
};

const server = http.createServer((request, response) => {
    if (request.method === "OPTIONS") {
        response.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        });
        response.end();
        return;
    }

    if (request.url === "/health") {
        sendJson(response, 200, { status: "ok", service: "swiftflow-backend" });
        return;
    }

    if (request.url === "/api") {
        sendJson(response, 200, {
            message: "SwiftFlow backend is ready for route, booking, and rewards APIs.",
        });
        return;
    }

    sendJson(response, 404, { error: "Not found" });
});

server.listen(PORT, () => {
    console.log(`SwiftFlow backend listening on http://localhost:${PORT}`);
});
