import { apiFetch, APP_ID } from './client';

/**
 * Generic client for `/api/apps/:appId/entities/:entityName`.
 * Request/response bodies use snake_case (matches .NET JsonNamingPolicy.SnakeCaseLower).
 */
function entityPath(entityName) {
    return `/apps/${APP_ID}/entities/${encodeURIComponent(entityName)}`;
}

/**
 * @param {string} entityName - e.g. "MoodEntry"
 * @param {{ sort?: string, limit?: number, skip?: number, filter?: Record<string, unknown>|string }} [options]
 */
export function listEntities(entityName, options = {}) {
    const { sort, limit, skip, filter } = options;
    const params = new URLSearchParams();
    if (sort != null && sort !== '') params.set('sort', sort);
    if (limit != null) params.set('limit', String(limit));
    if (skip != null) params.set('skip', String(skip));
    if (filter != null) {
        const q = typeof filter === 'string' ? filter : JSON.stringify(filter);
        params.set('q', q);
    }
    const qs = params.toString();
    return apiFetch(`${entityPath(entityName)}${qs ? `?${qs}` : ''}`);
}

export function getEntity(entityName, id) {
    return apiFetch(`${entityPath(entityName)}/${encodeURIComponent(id)}`);
}

export function createEntity(entityName, data) {
    return apiFetch(entityPath(entityName), {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function updateEntity(entityName, id, data) {
    return apiFetch(`${entityPath(entityName)}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export function patchEntity(entityName, id, data) {
    return apiFetch(`${entityPath(entityName)}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export function deleteEntity(entityName, id) {
    return apiFetch(`${entityPath(entityName)}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}
