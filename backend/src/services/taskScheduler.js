import { CloudTasksClient } from "@google-cloud/tasks";

import { env } from "../config/env.js";

const client = new CloudTasksClient();
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;

const isConfigured = () => Boolean(
    env.googleCloudProjectId &&
    env.cloudTasksLocation &&
    env.cloudTasksQueue &&
    env.backendBaseUrl,
);

const buildTaskUrl = (path) => `${env.backendBaseUrl.replace(/\/$/, "")}${path}`;

const todayAtTripTime = (time) => {
    const match = /^(\d{2}):(\d{2})$/.exec(time ?? "");
    if (!match) {
        return null;
    }

    const date = new Date();
    date.setHours(Number(match[1]), Number(match[2]), 0, 0);
    if (date.getTime() <= Date.now()) {
        date.setDate(date.getDate() + 1);
    }
    return date;
};

const createHttpTask = async ({ path, payload, scheduleTime, taskId }) => {
    if (!isConfigured()) {
        return {
            skipped: true,
            reason: "Cloud Tasks is not configured.",
            path,
        };
    }

    const parent = client.queuePath(env.googleCloudProjectId, env.cloudTasksLocation, env.cloudTasksQueue);
    const task = {
        httpRequest: {
            httpMethod: "POST",
            url: buildTaskUrl(path),
            headers: {
                "Content-Type": "application/json",
                ...(env.internalTaskSecret ? { "X-SwiftFlow-Task-Secret": env.internalTaskSecret } : {}),
            },
            body: Buffer.from(JSON.stringify(payload)).toString("base64"),
        },
    };

    if (env.taskInvokerServiceAccount) {
        task.httpRequest.oidcToken = {
            serviceAccountEmail: env.taskInvokerServiceAccount,
            audience: env.backendBaseUrl.replace(/\/$/, ""),
        };
    }

    if (scheduleTime && scheduleTime.getTime() > Date.now()) {
        task.scheduleTime = {
            seconds: Math.floor(scheduleTime.getTime() / 1000),
        };
    }

    if (taskId) {
        task.name = client.taskPath(env.googleCloudProjectId, env.cloudTasksLocation, env.cloudTasksQueue, taskId);
    }

    try {
        const [response] = await client.createTask({ parent, task });
        return {
            name: response.name,
            path,
            scheduleTime: scheduleTime?.toISOString() ?? null,
        };
    } catch (error) {
        if (error?.code === 6 || error?.message?.includes("ALREADY_EXISTS")) {
            return {
                skipped: true,
                reason: "Task already exists.",
                path,
                scheduleTime: scheduleTime?.toISOString() ?? null,
            };
        }

        throw error;
    }
};

export const enqueueBookingLifecycleTasks = async ({ userId, bookingType, booking }) => {
    const departure = todayAtTripTime(booking?.departureTime);
    if (!departure || !booking?.confirmed) {
        return [];
    }

    const taskBaseId = `${userId}-${bookingType}-${booking.confirmationCode ?? booking.id ?? Date.now()}`
        .replace(/[^A-Za-z0-9_-]/g, "-")
        .slice(0, 400);
    const reminderAt = new Date(departure.getTime() - FIFTEEN_MINUTES);
    const expireAt = new Date(departure.getTime() + FIVE_MINUTES);
    const tasks = [];

    if (reminderAt.getTime() > Date.now()) {
        tasks.push(await createHttpTask({
            path: "/api/tasks/send-trip-reminder",
            payload: {
                userId,
                bookingType,
                confirmationCode: booking.confirmationCode,
            },
            scheduleTime: reminderAt,
            taskId: `${taskBaseId}-reminder`,
        }));
    }

    tasks.push(await createHttpTask({
        path: "/api/tasks/expire-ticket",
        payload: {
            userId,
            bookingType,
            confirmationCode: booking.confirmationCode,
        },
        scheduleTime: expireAt,
        taskId: `${taskBaseId}-expire`,
    }));

    return tasks;
};
