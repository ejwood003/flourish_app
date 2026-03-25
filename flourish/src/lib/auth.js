const AUTH_KEY = 'flourish_auth';

export const getAuth = () => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
};

export const setAuth = (userType, userId = null) => {
    localStorage.setItem(
        AUTH_KEY,
        JSON.stringify({
            loggedIn: true,
            userType,
            ...(userId != null && userId !== '' ? { userId } : {}),
        }),
    );
};

export const clearAuth = () => {
    localStorage.removeItem(AUTH_KEY);
};

export const isLoggedIn = () => {
    const auth = getAuth();
    if (!auth) return false;
    return auth.loggedIn === true;
};

export const getUserType = () => {
    const auth = getAuth();
    if (!auth) return null;
    return auth.userType;
};

export const getUserId = () => {
    const auth = getAuth();
    if (!auth) return null;
    return auth.userId ?? auth.user_id ?? null;
};
