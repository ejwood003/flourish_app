import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AUTH_ME_KEY } from '@/hooks/useCurrentUserId';
import NavigationTracker from '@/lib/NavigationTracker';
import { pagesConfig } from './pages.config';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { isLoggedIn, getUserType, setAuth, clearAuth } from '@/lib/auth';
import { fetchSession } from '@/api/authApi';

const { Pages, Layout } = pagesConfig;

const PUBLIC_PAGE_NAMES = ['Welcome', 'Onboarding'];

const LayoutWrapper = ({ children, currentPageName }) =>
    Layout ? (
        <Layout currentPageName={currentPageName}>{children}</Layout>
    ) : (
        <>{children}</>
    );

const PARTNER_PAGES = ['PartnerHome', 'PartnerJournalView', 'Onboarding', 'Welcome'];

const ProtectedRoute = ({ pageName, Page }) => {
    const loggedIn = isLoggedIn();
    const userType = getUserType();

    if (!loggedIn) {
        return <Navigate to="/Welcome" replace />;
    }

    if (userType === 'partner' && !PARTNER_PAGES.includes(pageName)) {
        return <Navigate to="/PartnerHome" replace />;
    }

    return (
        <LayoutWrapper currentPageName={pageName}>
            <Page />
        </LayoutWrapper>
    );
};

const AppRoutes = () => {
    const loggedIn = isLoggedIn();
    const userType = getUserType();

    const homePath = !loggedIn
        ? '/Welcome'
        : userType === 'partner'
            ? '/PartnerHome'
            : '/Home';

    return (
        <Routes>
            <Route path="/" element={<Navigate to={homePath} replace />} />

            <Route path="/Welcome" element={<Pages.Welcome />} />
            <Route path="/Onboarding" element={<Pages.Onboarding />} />

            {Object.entries(Pages)
                .filter(([path]) => !PUBLIC_PAGE_NAMES.includes(path))
                .map(([path, Page]) => (
                    <Route
                        key={path}
                        path={`/${path}`}
                        element={<ProtectedRoute pageName={path} Page={Page} />}
                    />
                ))}
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};

function AppShell() {
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await fetchSession();
                if (cancelled) return;
                if (data) {
                    queryClientInstance.setQueryData(AUTH_ME_KEY, data);
                    const ut = data.user_type ?? data.userType;
                    const uid = data.user_id ?? data.userId;
                    if (ut) setAuth(ut, uid);
                    else clearAuth();
                } else {
                    queryClientInstance.setQueryData(AUTH_ME_KEY, null);
                    clearAuth();
                }
            } catch {
                if (!cancelled) {
                    queryClientInstance.setQueryData(AUTH_ME_KEY, null);
                    clearAuth();
                }
            } finally {
                if (!cancelled) setSessionReady(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (!sessionReady) {
        return <div className="min-h-screen bg-[#FEF9F5]" aria-busy="true" />;
    }

    return (
        <>
            <NavigationTracker />
            <AppRoutes />
            <Toaster />
        </>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClientInstance}>
            <Router>
                <AppShell />
            </Router>
        </QueryClientProvider>
    );
}

export default App;
