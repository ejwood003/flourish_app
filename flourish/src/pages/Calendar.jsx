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
import { useNavigate, useLocation } from 'react-router-dom';
import DayDetailsDropdowns from '@/components/calendar/DayDetailsDropdowns';
import MonthView from '@/components/calendar/MonthView';

export default function Calendar() {
    const navigate = useNavigate();
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
                <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-[#9D8AA5]" />
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
                <h3 className="font-semibold text-[#4A4458] mb-4">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>

                <DayDetailsDropdowns
                    moodEntries={selectedMoods}
                    babyActivities={selectedActivities}
                    babyMoods={selectedBabyMoods}
                    journalEntries={selectedJournals}
                />
            </div>
        </div>
    );
}
