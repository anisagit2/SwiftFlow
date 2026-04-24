import { env } from "../config/env.js";

const getAllowedOrigin = (request) => {
    const origin = request?.headers?.origin;

    if (!origin) {
        return env.allowedOrigins[0] ?? "http://localhost:5173";
    }

    if (env.allowedOrigins.includes("*") || env.allowedOrigins.includes(origin)) {
        return origin;
    }

    return env.allowedOrigins[0] ?? origin;
};

export const buildCorsHeaders = (request) => ({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": getAllowedOrigin(request),
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-SwiftFlow-Language, X-SwiftFlow-Task-Secret",
});

export const sendJson = (response, statusCode, payload, request = null) => {
    response.writeHead(statusCode, buildCorsHeaders(request));
    response.end(JSON.stringify(payload));
};
