    import React, { useState } from 'react';
    import { useQuery } from '@tanstack/react-query';
    import { base44 } from '@/api/base44Client';
    import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, subDays } from 'date-fns';
    import { ChevronLeft, ChevronRight, TrendingUp, Heart, Moon, Droplets, Sparkles, Clock } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
    import DayDetailsDropdowns from '@/components/calendar/DayDetailsDropdowns';

    const getMoodColor = (value) => {
    if (value <= 20) return 'bg-[#B8A5C4]';
    if (value <= 40) return 'bg-[#C4A3A7]';
    if (value <= 60) return 'bg-[#E8E4F3]';
    if (value <= 80) return 'bg-[#D9EEF2]';
    return 'bg-[#A8D5BA]';
    };

    export default function Calendar() {
    const [activeTab, setActiveTab] = useState('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const { data: moodEntries = [] } = useQuery({
        queryKey: ['moodEntries'],
        queryFn: () => base44.entities.MoodEntry.list('-date', 100),
    });

    const { data: babyActivities = [] } = useQuery({
        queryKey: ['babyActivitiesCalendar'],
        queryFn: () => base44.entities.BabyActivity.list('-timestamp', 200),
    });

    const { data: journalEntries = [] } = useQuery({
        queryKey: ['journalEntriesCalendar'],
        queryFn: () => base44.entities.JournalEntry.list('-created_date', 100),
    });

    const { data: babyMoods = [] } = useQuery({
        queryKey: ['babyMoodsCalendar'],
        queryFn: () => base44.entities.BabyMood.list('-timestamp', 200),
    });

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const getMoodsForDate = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return moodEntries.filter(m => m.date === dateStr);
    };

    const getActivitiesForDate = (date) => {
        return babyActivities.filter(a => isSameDay(new Date(a.timestamp), date));
    };

    const getJournalEntriesForDate = (date) => {
        return journalEntries.filter(j => isSameDay(new Date(j.created_date), date));
    };

    const selectedMoods = getMoodsForDate(selectedDate);
    const selectedActivities = getActivitiesForDate(selectedDate);
    const selectedJournals = getJournalEntriesForDate(selectedDate);

    const getAverageMood = (moods) => {
        if (moods.length === 0) return null;
        return Math.round(moods.reduce((sum, m) => sum + m.mood_value, 0) / moods.length);
    };

    // Insights calculations
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'yyyy-MM-dd');
    });

    const moodTrends = last7Days.map(date => {
        const dayMoods = moodEntries.filter(m => m.date === date);
        const avgMood = dayMoods.length > 0 
        ? Math.round(dayMoods.reduce((sum, m) => sum + m.mood_value, 0) / dayMoods.length)
        : null;
        return {
        date: format(new Date(date), 'EEE'),
        mood: avgMood
        };
    });

    const weekAvgMood = moodTrends.filter(d => d.mood !== null).length > 0
        ? Math.round(moodTrends.filter(d => d.mood !== null).reduce((sum, d) => sum + d.mood, 0) / moodTrends.filter(d => d.mood !== null).length)
        : null;

    const highestMoodDay = moodTrends.reduce((max, d) => d.mood > (max?.mood || 0) ? d : max, {});

    const sleepMoodData = last7Days.map(date => {
        const dayMoods = moodEntries.filter(m => m.date === date);
        const avgMood = dayMoods.length > 0 
        ? Math.round(dayMoods.reduce((sum, m) => sum + m.mood_value, 0) / dayMoods.length)
        : null;
        
        const naps = babyActivities.filter(a => 
        a.type === 'nap' && format(new Date(a.timestamp), 'yyyy-MM-dd') === date
        );
        const totalSleep = naps.reduce((sum, n) => sum + (n.duration_minutes || 0), 0) / 60;
        
        return {
        date: format(new Date(date), 'EEE'),
        sleep: Math.round(totalSleep * 10) / 10,
        mood: avgMood
        };
    }).filter(d => d.mood !== null);

    const feedingTimes = babyActivities
        .filter(a => ['breastfeed', 'bottle'].includes(a.type))
        .map(a => new Date(a.timestamp).getHours());
    
    const feedingDistribution = Array.from({ length: 24 }, (_, hour) => ({
        hour: hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour-12}pm`,
        count: feedingTimes.filter(h => h === hour).length
    })).filter(d => d.count > 0);

    const mostCommonFeedingHour = feedingDistribution.reduce((max, d) => d.count > (max?.count || 0) ? d : max, {});

    // Mom Insights - Mood + Mindfulness Correlation
    const daysWithJournal = new Set(journalEntries.map(j => format(new Date(j.created_date), 'yyyy-MM-dd')));
    const moodWithJournal = moodEntries.filter(m => daysWithJournal.has(m.date));
    const moodWithoutJournal = moodEntries.filter(m => !daysWithJournal.has(m.date));
    const avgMoodWithJournal = moodWithJournal.length > 0 ? Math.round(moodWithJournal.reduce((sum, m) => sum + m.mood_value, 0) / moodWithJournal.length) : null;
    const avgMoodWithoutJournal = moodWithoutJournal.length > 0 ? Math.round(moodWithoutJournal.reduce((sum, m) => sum + m.mood_value, 0) / moodWithoutJournal.length) : null;

    // Mom Insights - Mood by Time of Day
    const moodsByTimeOfDay = moodEntries
        .filter(m => m.time)
        .map(m => ({
        hour: parseInt(m.time.split(':')[0]),
        mood: m.mood_value
        }));

    const timeOfDayGroups = [
        { label: 'Morning (6-11am)', hours: [6, 7, 8, 9, 10, 11] },
        { label: 'Afternoon (12-5pm)', hours: [12, 13, 14, 15, 16, 17] },
        { label: 'Evening (6-11pm)', hours: [18, 19, 20, 21, 22, 23] }
    ];

    const moodByTimeData = timeOfDayGroups.map(group => {
        const moods = moodsByTimeOfDay.filter(m => group.hours.includes(m.hour));
        const avgMood = moods.length > 0 ? Math.round(moods.reduce((sum, m) => sum + m.mood, 0) / moods.length) : null;
        return {
        time: group.label.split(' ')[0],
        mood: avgMood
        };
    }).filter(d => d.mood !== null);

    const lowestTimeOfDay = moodByTimeData.reduce((min, d) => !min || d.mood < min.mood ? d : min, null);

    // Baby Insights - Mood + Sleep
    const babyMoodsLast7Days = babyMoods.filter(bm => {
        const moodDate = new Date(bm.timestamp);
        const daysDiff = Math.floor((new Date() - moodDate) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
    });

    const napsByDay = {};
    babyActivities
        .filter(a => a.type === 'nap')
        .forEach(nap => {
        const date = format(new Date(nap.timestamp), 'yyyy-MM-dd');
        if (!napsByDay[date]) napsByDay[date] = [];
        napsByDay[date].push(nap);
        });

    const babyMoodSleepCorrelation = babyMoodsLast7Days.map(bm => {
        const date = format(new Date(bm.timestamp), 'yyyy-MM-dd');
        const naps = napsByDay[date] || [];
        const totalNapMinutes = naps.reduce((sum, n) => sum + (n.duration_minutes || 0), 0);
        return {
        mood: bm.mood_value,
        napHours: totalNapMinutes / 60,
        tags: bm.tags || []
        };
    });

    const avgMoodWithLongNaps = babyMoodSleepCorrelation.filter(d => d.napHours >= 2).length > 0
        ? Math.round(babyMoodSleepCorrelation.filter(d => d.napHours >= 2).reduce((sum, d) => sum + d.mood, 0) / babyMoodSleepCorrelation.filter(d => d.napHours >= 2).length)
        : null;
    const avgMoodWithShortNaps = babyMoodSleepCorrelation.filter(d => d.napHours < 2 && d.napHours > 0).length > 0
        ? Math.round(babyMoodSleepCorrelation.filter(d => d.napHours < 2 && d.napHours > 0).reduce((sum, d) => sum + d.mood, 0) / babyMoodSleepCorrelation.filter(d => d.napHours < 2 && d.napHours > 0).length)
        : null;

    // Baby Insights - Mood Tag Associations
    const allBabyTags = babyMoodsLast7Days.flatMap(bm => (bm.tags || []).map(tag => ({
        tag,
        hour: new Date(bm.timestamp).getHours()
    })));

    const tagByTimeOfDay = {};
    allBabyTags.forEach(({ tag, hour }) => {
        if (!tagByTimeOfDay[tag]) tagByTimeOfDay[tag] = { morning: 0, afternoon: 0, evening: 0 };
        if (hour >= 6 && hour < 12) tagByTimeOfDay[tag].morning++;
        else if (hour >= 12 && hour < 18) tagByTimeOfDay[tag].afternoon++;
        else if (hour >= 18 || hour < 6) tagByTimeOfDay[tag].evening++;
    });

    const mostCommonTagTime = Object.entries(tagByTimeOfDay)
        .map(([tag, times]) => {
        const max = Math.max(times.morning, times.afternoon, times.evening);
        const period = times.morning === max ? 'morning' : times.afternoon === max ? 'afternoon' : 'evening';
        return { tag, period, count: max };
        })
        .sort((a, b) => b.count - a.count)[0];

    // Highest and lowest mood days
    const moodsByDay = last7Days.map(date => {
        const dayMoods = moodEntries.filter(m => m.date === date);
        const avgMood = dayMoods.length > 0 ? Math.round(dayMoods.reduce((sum, m) => sum + m.mood_value, 0) / dayMoods.length) : null;
        return { date, mood: avgMood };
    }).filter(d => d.mood !== null);

    const highestDay = moodsByDay.reduce((max, d) => !max || d.mood > max.mood ? d : max, null);
    const lowestDay = moodsByDay.reduce((min, d) => !min || d.mood < min.mood ? d : min, null);

    return (
        <div className="space-y-6 pb-8">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-[#E8E4F3]/50 rounded-2xl">
            <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'calendar'
                ? 'bg-white text-[#4A4458] shadow-sm'
                : 'text-[#7D7589]'
            }`}
            >
            Calendar
            </button>
            <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'insights'
                ? 'bg-white text-[#4A4458] shadow-sm'
                : 'text-[#7D7589]'
            }`}
            >
            Insights
            </button>
        </div>

        {activeTab === 'calendar' ? (
            <>
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                <button
                    onClick={previousMonth}
                    className="p-2 rounded-xl hover:bg-[#E8E4F3] transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-[#8B7A9F]" />
                </button>
                <h2 className="text-lg font-semibold text-[#4A4458]">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl hover:bg-[#E8E4F3] transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-[#8B7A9F]" />
                </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-[#7D7589] py-2">
                    {day}
                    </div>
                ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {daysInMonth.map(day => {
                    const dayMoods = getMoodsForDate(day);
                    const avgMood = getAverageMood(dayMoods);
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                    <motion.button
                        key={day.toString()}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDate(day)}
                        className={`aspect-square rounded-xl p-2 relative transition-all ${
                        isSelected
                            ? 'bg-[#8B7A9F] text-white'
                            : isTodayDate
                            ? 'bg-[#E8E4F3] text-[#4A4458]'
                            : 'hover:bg-[#E8E4F3]/50 text-[#4A4458]'
                        }`}
                    >
                        <div className="text-sm font-medium">{format(day, 'd')}</div>
                        {avgMood !== null && (
                        <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${
                            isSelected ? 'bg-white/60' : getMoodColor(avgMood)
                        }`} />
                        )}
                    </motion.button>
                    );
                })}
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="font-semibold text-[#4A4458] mb-4">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>

                <DayDetailsDropdowns
                moodEntries={selectedMoods}
                babyActivities={selectedActivities}
                journalEntries={selectedJournals}
                />
            </div>
            </>
        ) : (
            <>
            {/* MOM Section Header */}
            <div className="bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#4A4458]">Mom</h2>
                <p className="text-sm text-[#7D7589] mt-1">Understanding your emotional patterns</p>
            </div>

            {/* Mood Trends Over Time */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-[#8B7A9F]" />
                <h3 className="font-semibold text-[#4A4458]">Mood Trends Over Time</h3>
                </div>
                
                <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4F3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#7D7589', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#7D7589', fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="mood" stroke="#8B7A9F" strokeWidth={3} dot={{ fill: '#8B7A9F', r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                {weekAvgMood && (
                    <div className="p-3 bg-[#F5EEF8] rounded-xl">
                    <p className="text-xs text-[#7D7589] mb-1">Weekly Average</p>
                    <p className="text-lg font-semibold text-[#4A4458]">{weekAvgMood}/100</p>
                    </div>
                )}
                
                {highestDay && lowestDay && (
                    <div className="p-3 bg-[#F5EEF8] rounded-xl">
                    <p className="text-sm text-[#4A4458]">
                        This week your mood was highest on {format(new Date(highestDay.date), 'EEEE')} and lowest on {format(new Date(lowestDay.date), 'EEEE')}.
                    </p>
                    </div>
                )}
                </div>
            </div>

            {/* Mood + Mindfulness Correlation */}
            {(avgMoodWithJournal || avgMoodWithoutJournal) && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[#8B7A9F]" />
                    <h3 className="font-semibold text-[#4A4458]">Mood + Mindfulness</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    {avgMoodWithJournal && (
                    <div className="p-4 bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] rounded-xl">
                        <p className="text-xs text-[#7D7589] mb-1">With Journaling</p>
                        <p className="text-2xl font-semibold text-[#4A4458]">{avgMoodWithJournal}</p>
                    </div>
                    )}
                    {avgMoodWithoutJournal && (
                    <div className="p-4 bg-[#F5EEF8] rounded-xl">
                        <p className="text-xs text-[#7D7589] mb-1">Without Journaling</p>
                        <p className="text-2xl font-semibold text-[#4A4458]">{avgMoodWithoutJournal}</p>
                    </div>
                    )}
                </div>

                {avgMoodWithJournal && avgMoodWithoutJournal && (
                    <div className="p-3 bg-[#F5EEF8] rounded-xl">
                    <p className="text-sm text-[#4A4458]">
                        {avgMoodWithJournal > avgMoodWithoutJournal
                        ? `On days you journaled, your mood was on average ${Math.round(((avgMoodWithJournal - avgMoodWithoutJournal) / avgMoodWithoutJournal) * 100)}% higher.`
                        : `You tend to journal more on lower-mood days.`}
                    </p>
                    </div>
                )}
                </div>
            )}

            {/* Mood by Time of Day */}
            {moodByTimeData.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-[#8B7A9F]" />
                    <h3 className="font-semibold text-[#4A4458]">Mood Throughout the Day</h3>
                </div>

                <div className="h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moodByTimeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E4F3" vertical={false} />
                        <XAxis dataKey="time" tick={{ fill: '#7D7589', fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#7D7589', fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="mood" fill="#8B7A9F" radius={[8, 8, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>

                {lowestTimeOfDay && (
                    <div className="p-3 bg-[#F5EEF8] rounded-xl">
                    <p className="text-sm text-[#4A4458]">
                        Your mood often dips in the {lowestTimeOfDay.time.toLowerCase()}.
                    </p>
                    </div>
                )}
                </div>
            )}

            {/* BABY Section Header */}
            <div className="bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] rounded-3xl p-6 shadow-sm mt-8">
                <h2 className="text-xl font-semibold text-[#4A4458]">Baby</h2>
                <p className="text-sm text-[#7D7589] mt-1">Discovering patterns in baby's rhythms</p>
            </div>

            {/* Baby Mood + Sleep */}
            {babyMoodSleepCorrelation.length > 0 && (avgMoodWithLongNaps || avgMoodWithShortNaps) && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Moon className="w-5 h-5 text-[#8B7A9F]" />
                    <h3 className="font-semibold text-[#4A4458]">Baby Mood + Sleep</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    {avgMoodWithLongNaps && (
                    <div className="p-4 bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] rounded-xl">
                        <p className="text-xs text-[#7D7589] mb-1">Long Naps (2+ hrs)</p>
                        <p className="text-2xl font-semibold text-[#4A4458]">{avgMoodWithLongNaps}</p>
                    </div>
                    )}
                    {avgMoodWithShortNaps && (
                    <div className="p-4 bg-[#F5EEF8] rounded-xl">
                        <p className="text-xs text-[#7D7589] mb-1">Short Naps (&lt;2 hrs)</p>
                        <p className="text-2xl font-semibold text-[#4A4458]">{avgMoodWithShortNaps}</p>
                    </div>
                    )}
                </div>

                {avgMoodWithLongNaps && avgMoodWithShortNaps && (
                    <div className="p-3 bg-[#F5EEF8] rounded-xl">
                    <p className="text-sm text-[#4A4458]">
                        {avgMoodWithLongNaps > avgMoodWithShortNaps
                        ? 'Baby tends to be calmer on days with longer naps.'
                        : 'Baby mood varies across different nap lengths.'}
                    </p>
                    </div>
                )}
                </div>
            )}

            {/* Baby Mood Tag Associations */}
            {mostCommonTagTime && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#8B7A9F]" />
                    <h3 className="font-semibold text-[#4A4458]">Mood Tag Patterns</h3>
                </div>

                <div className="p-4 bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] rounded-xl mb-3">
                    <p className="text-xs text-[#7D7589] mb-1">Most Common Tag</p>
                    <p className="text-lg font-semibold text-[#4A4458] mb-1 capitalize">{mostCommonTagTime.tag}</p>
                    <p className="text-sm text-[#7D7589]">Appears most in the {mostCommonTagTime.period}</p>
                </div>

                <div className="p-3 bg-[#F5EEF8] rounded-xl">
                    <p className="text-sm text-[#4A4458] capitalize">
                    "{mostCommonTagTime.tag}" tags most frequently appear in the {mostCommonTagTime.period}.
                    </p>
                </div>
                </div>
            )}

            {/* Weekly Summary Card */}
            <div className="bg-gradient-to-br from-[#EDD9E8] to-[#F5E6EA] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#8B7A9F]" />
                <h2 className="font-semibold text-[#4A4458]">Weekly Summary</h2>
                </div>

                <p className="text-sm text-[#4A4458] leading-relaxed">
                {weekAvgMood && avgMoodWithJournal && avgMoodWithLongNaps
                    ? `This week, your mood averaged ${weekAvgMood}/100${highestDay ? ` and was highest on ${format(new Date(highestDay.date), 'EEEE')}` : ''}. ${
                        avgMoodWithJournal > (avgMoodWithoutJournal || 0) 
                        ? 'Journaling appears to support your emotional well-being. ' 
                        : ''
                    }${
                        avgMoodWithLongNaps > (avgMoodWithShortNaps || 0)
                        ? 'Baby seemed calmest with longer naps. '
                        : ''
                    }${
                        lowestTimeOfDay
                        ? `Consider adding a moment of self-care in the ${lowestTimeOfDay.time.toLowerCase()} when your mood tends to dip.`
                        : ''
                    }`
                    : 'Track your mood and baby activities daily to receive personalized weekly insights.'}
                </p>
            </div>
            </>
        )}
        </div>
    );
    }