import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMoodEntries } from '@/api/moodApi';
import { listJournalEntries } from '@/api/journalEntryApi';
import { listBabyActivities } from '@/api/babyActivityApi';
import { listBabyMoods } from '@/api/babyMoodApi';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';
import MomInsights from '@/components/insights/MomInsights';
import BabyInsights from '@/components/insights/BabyInsights';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Insights() {
    const navigate = useNavigate();
    const location = useLocation();

    const activeTab = location.pathname === '/insights' ? 'insights' : 'calendar';

    const [moodTimeView, setMoodTimeView] = useState('day');
    const [trendTimeframe, setTrendTimeframe] = useState('week');

    const { userId, isResolvingUser } = useCurrentUserId();

    const { data: moodEntries = [] } = useQuery({
        queryKey: ['moodEntries', userId],
        queryFn: () =>
            getMoodEntries({
                filter: { user_id: userId },
                sort: '-date',
                limit: 200,
            }),
        enabled: Boolean(userId),
    });

    const { data: journalEntries = [] } = useQuery({
        queryKey: ['journalEntries', userId],
        queryFn: () =>
            listJournalEntries({
                filter: { user_id: userId },
                sort: '-created_date',
                limit: 200,
            }),
        enabled: Boolean(userId),
    });

    const { data: babyActivities = [] } = useQuery({
        queryKey: ['babyActivities', userId],
        queryFn: () =>
            listBabyActivities({
                filter: { user_id: userId },
                sort: '-timestamp',
                limit: 200,
            }),
        enabled: Boolean(userId),
    });

    const { data: babyMoods = [] } = useQuery({
        queryKey: ['babyMoods', userId],
        queryFn: () =>
            listBabyMoods({
                filter: { user_id: userId },
                sort: '-timestamp',
                limit: 200,
            }),
        enabled: Boolean(userId),
    });

    return (
        <div className="space-y-6 pb-8">
            <div className="flex gap-2 p-1 bg-[#E8E4F3]/50 rounded-2xl">
                <button
                    type="button"
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
                    type="button"
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

            {isResolvingUser && (
                <p className="text-sm text-center text-[#5A4B70] px-4">Loading your profile…</p>
            )}

            {!isResolvingUser && !userId && (
                <p className="text-sm text-center text-[#5A4B70] px-4">
                    Sign in again to see insights for your data.
                </p>
            )}

            <MomInsights
                moodEntries={moodEntries}
                journalEntries={journalEntries}
                babyActivities={babyActivities}
                moodTimeView={moodTimeView}
                setMoodTimeView={setMoodTimeView}
                trendTimeframe={trendTimeframe}
                setTrendTimeframe={setTrendTimeframe}
            />

            <BabyInsights babyActivities={babyActivities} babyMoods={babyMoods} />
        </div>
    );
}
