import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchSession, postLogout } from '@/api/authApi';
import { clearAuth } from '@/lib/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [appPublicSettings, setAppPublicSettings] = useState(null);

    useEffect(() => {
        checkAppState();
    }, []);

    const checkUserAuth = async () => {
        try {
            setIsLoadingAuth(true);
            const data = await fetchSession();
            if (data) {
                setUser({
                    id: data.user_id ?? data.userId,
                    user_type: data.user_type ?? data.userType,
                });
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('User auth check failed:', error);
            setUser(null);
            setIsAuthenticated(false);
            setAuthError({
                type: 'auth_required',
                message: 'Authentication required',
            });
        } finally {
            setIsLoadingAuth(false);
        }
    };

    const checkAppState = async () => {
        setAuthError(null);
        setIsLoadingPublicSettings(false);
        await checkUserAuth();
    };

    const logout = async (shouldRedirect = true) => {
        setUser(null);
        setIsAuthenticated(false);
        try {
            await postLogout();
        } catch {
            /* ignore */
        }
        clearAuth();
        if (shouldRedirect && typeof window !== 'undefined') {
            window.location.assign('/Welcome');
        }
    };

    const navigateToLogin = () => {
        if (typeof window !== 'undefined') {
            window.location.assign('/Welcome');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoadingAuth,
                isLoadingPublicSettings,
                authError,
                appPublicSettings,
                logout,
                navigateToLogin,
                checkAppState,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
