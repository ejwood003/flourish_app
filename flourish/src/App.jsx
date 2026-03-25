import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { isLoggedIn, getUserType } from '@/lib/auth';

const { Pages, Layout } = pagesConfig;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
    <Layout currentPageName={currentPageName}>{children}</Layout>
    : <>{children}</>;

// Pages partners are allowed to access
const PARTNER_PAGES = ['PartnerHome', 'PartnerJournalView', 'Onboarding'];

const ProtectedRoute = ({ pageName, Page }) => {
    const loggedIn = isLoggedIn();
    const userType = getUserType();

    // Not logged in → always go to Onboarding
    if (!loggedIn) {
        return <Navigate to="/Onboarding" replace />;
    }

    // Partner trying to access a mother-only page → send to PartnerHome
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
        ? '/Onboarding'
        : userType === 'partner'
            ? '/PartnerHome'
            : '/Home';

    return (
        <Routes>
            <Route path="/" element={<Navigate to={homePath} replace />} />
            
            {/* Public route - no auth check */}
            <Route path="/Onboarding" element={
                <Pages.Onboarding />
            } />

            {/* All other pages are protected */}
            {Object.entries(Pages)
                .filter(([path]) => path !== 'Onboarding')
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

function App() {
    return (
        <QueryClientProvider client={queryClientInstance}>
            <Router>
                <NavigationTracker />
                <AppRoutes />
                <Toaster />
            </Router>
        </QueryClientProvider>
    );
}

export default App;