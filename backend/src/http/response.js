const defaultHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export const sendJson = (response, statusCode, payload) => {
    response.writeHead(statusCode, defaultHeaders);
    response.end(JSON.stringify(payload));
};
