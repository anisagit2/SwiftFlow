import { VertexAI } from '@google-cloud/vertexai';
import { ALERTS_SYSTEM_PROMPT, EXPLORE_SYSTEM_PROMPT } from './prompts.js';
import { env } from '../config/env.js';

const vertex_ai = new VertexAI({
    project: env.googleCloudProjectId,
    location: env.vertexAiLocation,
});

// Using gemini-1.5-flash for fast responses.
// Note: If you deploy a Gemma model to a Vertex AI Endpoint, you can replace
// 'gemini-1.5-flash' with 'projects/personal-claw-1/locations/us-central1/endpoints/YOUR_ENDPOINT_ID'
const geminiModel = vertex_ai.preview.getGenerativeModel({
  model: env.geminiModel,
  generationConfig: {
    maxOutputTokens: 1024,
    temperature: 0.2,
    topP: 0.8,
    topK: 40,
    responseMimeType: "application/json"
  },
});

export const generateAlerts = async (bookingDetails) => {
    try {
        const req = {
            contents: [{role: 'user', parts: [{text: `Generate an alert for this journey: ${JSON.stringify(bookingDetails)}`}]}],
            systemInstruction: { role: 'system', parts: [{text: ALERTS_SYSTEM_PROMPT}] }
        };
        const res = await geminiModel.generateContent(req);
        return JSON.parse(res.response.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("AI Generation Error", error);
        return {
            title: "Standard Alert",
            message: "No specific delays reported.",
            severity: "info",
            actionText: "Acknowledge"
        };
    }
};

export const generateExploreSuggestions = async (destination) => {
    try {
        const req = {
            contents: [{role: 'user', parts: [{text: `Generate points of interest near: ${destination}`}]}],
            systemInstruction: { role: 'system', parts: [{text: EXPLORE_SYSTEM_PROMPT}] }
        };
        const res = await geminiModel.generateContent(req);
        return JSON.parse(res.response.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("AI Generation Error", error);
        return [];
    }
};
