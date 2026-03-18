/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ArticleView from './pages/ArticleView.jsx';
import Baby from './pages/Baby.jsx';
import Calendar from './pages/Calendar.jsx';
// import CalendarDayDetail from './pages/CalendarDayDetail.jsx';
import Home from './pages/Home.jsx';
import Journal from './pages/Journal.jsx';
import LiveMeditation from './pages/LiveMeditation.jsx';
import MeditationPlayer from './pages/MeditationPlayer.jsx';
import Onboarding from './pages/Onboarding.jsx';
import PartnerHome from './pages/PartnerHome.jsx';
import PartnerJournalView from './pages/PartnerJournalView.jsx';
import Profile from './pages/Profile.jsx';
import Resources from './pages/Resources.jsx';
import __Layout from './Layout.jsx';
import Insights from './pages/Insights.jsx'


export const PAGES = {
    "ArticleView": ArticleView,
    "Baby": Baby,
    "Calendar": Calendar,
    // "CalendarDayDetail": CalendarDayDetail,
    "Home": Home,
    "Journal": Journal,
    "LiveMeditation": LiveMeditation,
    "MeditationPlayer": MeditationPlayer,
    "Onboarding": Onboarding,
    "PartnerHome": PartnerHome,
    "PartnerJournalView": PartnerJournalView,
    "Profile": Profile,
    "Resources": Resources,
    "Insights" : Insights
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};