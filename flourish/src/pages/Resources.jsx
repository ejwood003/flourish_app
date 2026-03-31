    import React, { useState } from 'react';
    import { useDocumentTitle } from '@/hooks/useDocumentTitle';
    import AffirmationsTab from '@/components/resources/AffirmationsTab';
    import MeditationsTab from '@/components/resources/MeditationsTab';
    import TipsTab from '@/components/resources/TipsTab';

    const tabs = [
    { id: 'meditations', label: 'Meditations' },
    { id: 'affirmations', label: 'Affirmations' },
    { id: 'tips', label: 'Tips & Articles' },
    ];

    export default function Resources() {
    useDocumentTitle('Resources');
    const params = new URLSearchParams(window.location.search);
    const [activeTab, setActiveTab] = useState(params.get('tab') || 'meditations');

    return (
        <div className="space-y-6 pb-8">
        <h1 className="text-2xl font-semibold text-[#4A4458]">Resources</h1>

        <div
            role="tablist"
            aria-label="Resource categories"
            className="flex gap-2 p-1 bg-[#F5EEF8] rounded-2xl"
        >
            {tabs.map((tab) => (
            <button
                key={tab.id}
                type="button"
                role="tab"
                id={`resource-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls="resources-tab-panel"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                    ? 'bg-white text-[#4A4458] shadow-sm'
                    : 'text-[#5A4B70]'
                }`}
            >
                {tab.label}
            </button>
            ))}
        </div>

        <div
            id="resources-tab-panel"
            role="tabpanel"
            aria-labelledby={`resource-tab-${activeTab}`}
        >
            {activeTab === 'affirmations' && <AffirmationsTab />}
            {activeTab === 'meditations' && <MeditationsTab />}
            {activeTab === 'tips' && <TipsTab />}
        </div>
        </div>
    );
    }