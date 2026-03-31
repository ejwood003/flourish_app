import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMoodEntries } from '@/api/moodApi';
import { listJournalEntries } from '@/api/journalEntryApi';
import { listBabyActivities } from '@/api/babyActivityApi';
import { listBabyMoods } from '@/api/babyMoodApi';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';
import { journalEntryCreatedAt } from '@/lib/journalEntryFields';
import { format, isSameDay } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import DayDetailsDropdowns from '@/components/calendar/DayDetailsDropdowns';
import MonthView from '@/components/calendar/MonthView';
import CalendarInsightsTabStrip from '@/components/CalendarInsightsTabStrip';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function Calendar() {
    useDocumentTitle('Calendar');
    const location = useLocation();

    const activeTab = location.pathname === '/insights' ? 'insights' : 'calendar';

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const { userId, isResolvingUser } = useCurrentUserId();

    const { data: moodEntries = [] } = useQuery({
        queryKey: ['moodEntries', userId],
        queryFn: () =>
            getMoodEntries({
                filter: { user_id: userId },
                sort: '-date',
                limit: 100,
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

    const { data: journalEntries = [] } = useQuery({
        queryKey: ['journalEntriesCalendar', userId],
        queryFn: () =>
            listJournalEntries({
                filter: { user_id: userId },
                sort: '-created_date',
                limit: 100,
            }),
        enabled: Boolean(userId),
    });

    const getMoodsForDate = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return moodEntries.filter((m) => {
            const d = m.date ?? m.Date;
            return d === dateStr;
        });
    };

    const getActivitiesForDate = (date) => {
        return babyActivities.filter((a) => {
            const ts = a.timestamp ?? a.Timestamp;
            return ts && isSameDay(new Date(ts), date);
        });
    };

    const getBabyMoodsForDate = (date) => {
        return babyMoods.filter((m) => {
            const ts = m.timestamp ?? m.Timestamp;
            return ts && isSameDay(new Date(ts), date);
        });
    };

    const getJournalEntriesForDate = (date) => {
        return journalEntries.filter((j) => {
            const created = journalEntryCreatedAt(j);
            return created && isSameDay(created, date);
        });
    };

    const selectedMoods = userId ? getMoodsForDate(selectedDate) : [];
    const selectedActivities = userId ? getActivitiesForDate(selectedDate) : [];
    const selectedBabyMoods = userId ? getBabyMoodsForDate(selectedDate) : [];
    const selectedJournals = userId ? getJournalEntriesForDate(selectedDate) : [];

    return (
        <div className="space-y-6 pb-8">
            <h1 className="text-2xl font-semibold text-[#4A4458]">Calendar</h1>

            <CalendarInsightsTabStrip activeTab={activeTab} />

            <div
                id="calendar-insights-panel"
                role="tabpanel"
                aria-labelledby="tab-calendar-view"
            >
                {isResolvingUser && (
                    <div className="flex justify-center py-6" aria-live="polite" aria-busy="true">
                        <Loader2 className="w-6 h-6 animate-spin text-[#9D8AA5]" aria-hidden />
                        <span className="sr-only">Loading calendar</span>
                    </div>
                )}

                {!isResolvingUser && !userId && (
                    <p className="text-sm text-center text-[#5A4B70] px-4">
                        Sign in again to see your mood, baby activity, and journal data on the calendar.
                    </p>
                )}

                <MonthView
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    moodEntries={moodEntries}
                />

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <h2 className="font-semibold text-[#4A4458] mb-4">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </h2>

                    <DayDetailsDropdowns
                        moodEntries={selectedMoods}
                        babyActivities={selectedActivities}
                        babyMoods={selectedBabyMoods}
                        journalEntries={selectedJournals}
                    />
                </div>
            </div>
        </div>
    );
}
