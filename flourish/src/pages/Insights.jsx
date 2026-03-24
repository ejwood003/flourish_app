import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MomInsights from '@/components/insights/MomInsights';
import BabyInsights from '@/components/insights/BabyInsights';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Insights() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const activeTab = location.pathname === '/insights' ? 'insights' : 'calendar';
    
    const [moodTimeView, setMoodTimeView] = useState('day');
    const [trendTimeframe, setTrendTimeframe] = useState('week');

    const { data: moodEntries = [] } = useQuery({
        queryKey: ['moodEntries'],
        queryFn: () => base44.entities.MoodEntry.list('-date', 100),
    });

    const { data: journalEntries = [] } = useQuery({
        queryKey: ['journalEntries'],
        queryFn: () => base44.entities.JournalEntry.list('-created_date', 100),
    });

    const { data: babyActivities = [] } = useQuery({
        queryKey: ['babyActivities'],
        queryFn: () => base44.entities.BabyActivity.list('-timestamp', 200),
    });

    const { data: babyMoods = [] } = useQuery({
        queryKey: ['babyMoods'],
        queryFn: () => base44.entities.BabyMood.list('-timestamp', 200),
    });

    return (
        <div className="space-y-6 pb-8">
            <div className="flex gap-2 p-1 bg-[#E8E4F3]/50 rounded-2xl">
                <button
                    onClick={() => navigate('/calendar')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        activeTab === 'calendar'
                            ? 'bg-white text-[#4A4458] shadow-sm'
                            : 'text-[#5A4B70]'
                    }`}
                >
                    Calendar
                </button>

                <button
                    onClick={() => navigate('/insights')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        activeTab === 'insights'
                            ? 'bg-white text-[#4A4458] shadow-sm'
                            : 'text-[#5A4B70]'
                    }`}
                >
                    Insights
                </button>
            </div>
            <MomInsights
                moodEntries={moodEntries}
                journalEntries={journalEntries}
                babyActivities={babyActivities}
                moodTimeView={moodTimeView}
                setMoodTimeView={setMoodTimeView}
                trendTimeframe={trendTimeframe}
                setTrendTimeframe={setTrendTimeframe}
            />

            <BabyInsights
                babyActivities={babyActivities}
                babyMoods={babyMoods}
            />
        </div>
    );
}