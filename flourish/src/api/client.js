/**
 * API base:
 * - Local dev: leave unset → `/api` (Vite proxy → backend), cookies are first-party.
 * - Azure Static Web Apps (API in same SWA): leave unset → `/api` on the SWA host.
 * - Separate API host (e.g. Azure Web App): set VITE_API_URL to the API root including `/api`, e.g.
 *   https://your-app.azurewebsites.net/api
 */
const configuredBase = import.meta.env.VITE_API_URL;
const APP_ID = import.meta.env.VITE_APP_ID || 'flourish';

export function resolveApiUrl(endpoint) {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (configuredBase != null && configuredBase !== '') {
        const base = String(configuredBase).replace(/\/$/, '');
        return `${base}${path}`;
    }
    return `/api${path}`;
}

function isPublicPath(pathname) {
    return (
        pathname.startsWith('/Welcome') ||
        pathname.startsWith('/Onboarding')
    );
}

export async function apiFetch(endpoint, options = {}) {
    const url = resolveApiUrl(endpoint);
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        credentials: 'include',
        ...options,
    });

    if (response.status === 401) {
        try {
            localStorage.removeItem('flourish_auth');
        } catch {
            /* ignore */
        }
        if (typeof window !== 'undefined') {
            const p = window.location.pathname || '';
            if (!isPublicPath(p)) {
                window.location.assign('/Welcome');
            }
        }
        const errorText = await response.text();
        throw new Error(errorText || 'Unauthorized');
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `API request failed: ${response.status}`);
    }

    if (response.status === 204) return null;

    return response.json();
}

export { APP_ID };
