import { env } from "../config/env.js";

const SUPPORTED_LANGUAGE_CODES = new Set([
    "en",
    "ms",
    "id",
    "zh",
    "zh-cn",
    "zh-tw",
    "ta",
    "hi",
    "th",
    "vi",
    "ko",
    "ja",
    "ar",
    "fr",
    "de",
    "es",
]);

const normalizeLanguageCode = (value = "") => {
    const code = value.toLowerCase().trim();
    if (!code) {
        return env.translationFallbackLanguage;
    }

    if (SUPPORTED_LANGUAGE_CODES.has(code)) {
        return code;
    }

    const base = code.split("-")[0];
    return SUPPORTED_LANGUAGE_CODES.has(base) ? base : env.translationFallbackLanguage;
};

export const getPreferredLanguage = (request) => {
    const explicitLanguage = request.headers["x-swiftflow-language"];
    if (explicitLanguage) {
        return normalizeLanguageCode(Array.isArray(explicitLanguage) ? explicitLanguage[0] : explicitLanguage);
    }

    const acceptLanguage = request.headers["accept-language"];
    if (!acceptLanguage) {
        return env.translationFallbackLanguage;
    }

    const preferred = acceptLanguage
        .split(",")
        .map((item) => item.trim().split(";")[0])
        .find(Boolean);

    return normalizeLanguageCode(preferred);
};

export const shouldTranslate = (language) =>
    env.translationEnabled && language && language !== env.translationFallbackLanguage;
