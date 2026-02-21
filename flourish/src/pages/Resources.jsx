    import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { createPageUrl } from '@/utils';
    import { UserCircle } from 'lucide-react';
    import AffirmationsTab from '@/components/resources/AffirmationsTab';
    import MeditationsTab from '@/components/resources/MeditationsTab';
    import TipsTab from '@/components/resources/TipsTab';

    const tabs = [
    { id: 'meditations', label: 'Meditations' },
    { id: 'affirmations', label: 'Affirmations' },
    { id: 'tips', label: 'Tips & Articles' },
    ];

    export default function Resources() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const [activeTab, setActiveTab] = useState(params.get('tab') || 'meditations');

    return (
        <div className="space-y-6 pb-8">
        <div className="mb-2 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-[#4A4458]">Resources</h1>
            <button
            onClick={() => navigate(createPageUrl('Profile'))}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
            <UserCircle className="w-8 h-8 text-[#8B7A9F]" />
            </button>
        </div>

        <div className="flex gap-2 p-1 bg-[#F5EEF8] rounded-2xl">
            {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                    ? 'bg-white text-[#4A4458] shadow-sm'
                    : 'text-[#7D7589]'
                }`}
            >
                {tab.label}
            </button>
            ))}
        </div>

        {activeTab === 'affirmations' && <AffirmationsTab />}
        {activeTab === 'meditations' && <MeditationsTab />}
        {activeTab === 'tips' && <TipsTab />}
        </div>
    );
    }