import { apiFetch, APP_ID } from "./client";

export function createMoodEntry(data) {
    return apiFetch(`/apps/${APP_ID}/entities/MoodEntry`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function getMoodEntries() {
    return apiFetch(`/apps/${APP_ID}/entities/MoodEntry`);
}

export function getMoodEntriesByUser(userId) {
    const q = encodeURIComponent(JSON.stringify({ user_id: userId }));
    return apiFetch(`/apps/${APP_ID}/entities/MoodEntry?q=${q}`);
}

export function deleteMoodEntry(id) {
    return apiFetch(`/apps/${APP_ID}/entities/MoodEntry/${id}`, {
        method: "DELETE",
    });
}