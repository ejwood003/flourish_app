import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, Baby, Library, Calendar } from 'lucide-react';

const navItems = [
{ name: 'Home', icon: Home, page: 'Home' },
{ name: 'Baby', icon: Baby, page: 'Baby' },
{ name: 'Calendar', icon: Calendar, page: 'Calendar' },
{ name: 'Resources', icon: Library, page: 'Resources' },
];

// App-wide shell that wraps each routed page and renders the bottom navigation bar.
export default function Layout({ children, currentPageName }) {
    // Scroll back to the top whenever the current page changes
    React.useEffect(() => {
    window.scrollTo(0, 0);
    }, [currentPageName]);

    return (
        <div className="min-h-screen bg-[#FEF9F5] pb-24">
            {/* Main content area where the current page component is rendered */}
            <main className="max-w-lg mx-auto px-4 pt-6">
            {children}
            </main>

            {/* Fixed bottom navigation bar for switching between primary app sections */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-[#E8E4F3]/50 safe-area-pb">
            <div className="max-w-lg mx-auto flex justify-around items-center py-2">
                {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                    <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-300 ${
                        isActive 
                        ? 'text-[#5A4B70] bg-[#E8E4F3]/40' 
                        : 'text-[#5A4B70] hover:text-[#5A4B70]'
                    }`}
                    >
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                    <span className="text-xs mt-1 font-medium">{item.name}</span>
                    </Link>
                );
                })}
            </div>
            </nav>
        </div>
    );
}