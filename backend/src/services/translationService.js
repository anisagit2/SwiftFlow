import { v2 } from "@google-cloud/translate";

import { shouldTranslate } from "./language.js";

const translateClient = new v2.Translate();

const isTranslatableString = (value) =>
    typeof value === "string" && value.trim().length > 0 && /[A-Za-z]/.test(value);

const translateText = async (text, targetLanguage) => {
    if (!shouldTranslate(targetLanguage) || !isTranslatableString(text)) {
        return text;
    }

    try {
        const [translated] = await translateClient.translate(text, targetLanguage);
        return translated;
    } catch (error) {
        console.error("Translation error", error);
        return text;
    }
};

export const translateAlertDetails = async (alertDetails, targetLanguage) => {
    if (!shouldTranslate(targetLanguage) || !alertDetails) {
        return alertDetails;
    }

    return {
        ...alertDetails,
        title: await translateText(alertDetails.title, targetLanguage),
        message: await translateText(alertDetails.message, targetLanguage),
    };
};

export const translateExploreSuggestions = async (suggestions, targetLanguage) => {
    if (!shouldTranslate(targetLanguage) || !Array.isArray(suggestions)) {
        return suggestions;
    }

    return Promise.all(suggestions.map(async (item) => {
        if (!item || typeof item !== "object") {
            return item;
        }

        const entries = await Promise.all(Object.entries(item).map(async ([key, value]) => [
            key,
            isTranslatableString(value) ? await translateText(value, targetLanguage) : value,
        ]));

        return Object.fromEntries(entries);
    }));
};

export const translateSnapshot = async (snapshot, targetLanguage) => {
    if (!shouldTranslate(targetLanguage) || !snapshot) {
        return snapshot;
    }

    return {
        ...snapshot,
        alerts: {
            ...snapshot.alerts,
            details: await translateAlertDetails(snapshot.alerts?.details, targetLanguage),
        },
    };
};
