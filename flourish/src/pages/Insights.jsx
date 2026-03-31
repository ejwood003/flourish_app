import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMoodEntries } from '@/api/moodApi';
import { listJournalEntries } from '@/api/journalEntryApi';
import { listBabyActivities } from '@/api/babyActivityApi';
import { listBabyMoods } from '@/api/babyMoodApi';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';
import MomInsights from '@/components/insights/MomInsights';
import BabyInsights from '@/components/insights/BabyInsights';
import { useLocation } from 'react-router-dom';
import CalendarInsightsTabStrip from '@/components/CalendarInsightsTabStrip';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function Insights() {
    useDocumentTitle('Insights');
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
            <h1 className="text-2xl font-semibold text-[#4A4458]">Insights</h1>

            <CalendarInsightsTabStrip activeTab={activeTab} />

            <div
                id="calendar-insights-panel"
                role="tabpanel"
                aria-labelledby="tab-insights-view"
            >
                {isResolvingUser && (
                    <p className="text-sm text-center text-[#5A4B70] px-4" aria-live="polite">
                        Loading your profile…
                    </p>
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
        </div>
    );
}
