const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const APP_ID = import.meta.env.VITE_APP_ID || "flourish";

export async function apiFetch(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        },
        credentials: "include",
        ...options,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `API request failed: ${response.status}`);
    }

    if (response.status === 204) return null;

    return response.json();
}

export { APP_ID };