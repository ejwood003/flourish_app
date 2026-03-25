// auth.js - localStorage-based auth helper

const AUTH_KEY = 'flourish_auth';

export const getAuth = () => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
};

export const setAuth = (userType) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({
        loggedIn: true,
        userType,
    }));
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