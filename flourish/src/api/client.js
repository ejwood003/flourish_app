/**
 * API base: leave VITE_API_URL unset in dev to use same-origin `/api` (Vite proxy → backend)
 * so auth cookies are first-party. Set VITE_API_URL for a full URL when needed.
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
