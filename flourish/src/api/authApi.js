import { resolveApiUrl } from './client';

export function postLogin(body) {
    return fetch(resolveApiUrl('/auth/login'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

export async function fetchSession() {
    const r = await fetch(resolveApiUrl('/auth/me'), { credentials: 'include' });
    if (!r.ok) return null;
    return r.json();
}

export async function postLogout() {
    await fetch(resolveApiUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
    });
}

export async function verifySupportConnection({ motherEmail, supportEmail }) {
    const r = await fetch(resolveApiUrl('/auth/verify-support'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mother_email: motherEmail,
            support_email: supportEmail,
        }),
    });
    const data = await r.json().catch(() => ({}));
    return data.ok === true;
}
