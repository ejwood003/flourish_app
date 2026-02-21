import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, Baby, BookOpen, Library, User, Calendar } from 'lucide-react';

const navItems = [
{ name: 'Home', icon: Home, page: 'Home' },
{ name: 'Baby', icon: Baby, page: 'Baby' },
{ name: 'Calendar', icon: Calendar, page: 'Calendar' },
{ name: 'Resources', icon: Library, page: 'Resources' },
];

export default function Layout({ children, currentPageName }) {
// Scroll to top on page change
React.useEffect(() => {
window.scrollTo(0, 0);
}, [currentPageName]);

return (
<div className="min-h-screen bg-[#FEF9F5] pb-24">
    <style>{`
    :root {
        --pale-cyan: #D9EEF2;
        --soft-lavender: #E8E4F3;
        --pale-mauve: #EDD9E8;
        --light-pink: #F5E6EA;
        --cream: #FEF9F5;
        --primary-purple: #8B7A9F;
        --text-primary: #4A4458;
        --text-secondary: #7D7589;
    }
    `}</style>
    
    <main className="max-w-lg mx-auto px-4 pt-6">
    {children}
    </main>

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
                ? 'text-[#8B7A9F] bg-[#E8E4F3]/40' 
                : 'text-[#7D7589] hover:text-[#8B7A9F]'
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