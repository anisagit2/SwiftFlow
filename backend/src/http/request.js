export const parseJsonBody = async (request) => {
    const chunks = [];

    for await (const chunk of request) {
        chunks.push(chunk);
    }

    if (chunks.length === 0) {
        return {};
    }

    const rawBody = Buffer.concat(chunks).toString("utf8").trim();

    if (!rawBody) {
        return {};
    }

    try {
        return JSON.parse(rawBody);
    } catch {
        throw new Error("Request body must be valid JSON.");
    }
};

export const getUrl = (request) => new URL(request.url ?? "/", "http://localhost:3001");
