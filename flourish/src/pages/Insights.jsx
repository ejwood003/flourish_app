    import React, { useState } from 'react';
    import { useQuery } from '@tanstack/react-query';
    import { base44 } from '@/api/base44Client';
    import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
    import { Heart, Moon, Droplets, Sparkles, Clock, TrendingUp, Brain, Wind, Baby as BabyIcon } from 'lucide-react';
    import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

    export default function Insights() {
    const [moodTimeView, setMoodTimeView] = useState('day'); // 'day' or 'week'
    const [trendTimeframe, setTrendTimeframe] = useState('week'); // 'week', '2weeks', 'month'

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

    // Helper functions
    const getTrendDays = () => {
        if (trendTimeframe === 'week') return 7;
        if (trendTimeframe === '2weeks') return 14;
        return 30;
    };

    const trendDays = Array.from({ length: getTrendDays() }, (_, i) => {
        const date = subDays(new Date(), getTrendDays() - 1 - i);
        return format(date, 'yyyy-MM-dd');
    });

    // Mood Trends
    const moodTrendsData = trendDays.map(date => {
        const dayMoods = moodEntries.filter(m => m.date === date);
        const avgMood = dayMoods.length > 0 
        ? Math.round(dayMoods.reduce((sum, m) => sum + m.mood_value, 0) / dayMoods.length)
        : null;
        return {
        date: trendTimeframe === 'week' ? format(new Date(date), 'EEE') : format(new Date(date), 'MM/dd'),
        mood: avgMood
        };
    });

    // Mood Throughout Day/Week
    const moodTimeData = moodTimeView === 'day'
        ? [
            { label: 'Morning', hours: [6, 7, 8, 9, 10, 11] },
            { label: 'Afternoon', hours: [12, 13, 14, 15, 16, 17] },
            { label: 'Evening', hours: [18, 19, 20, 21, 22, 23] }
        ].map(group => {
            const moods = moodEntries.filter(m => m.time && group.hours.includes(parseInt(m.time.split(':')[0])));
            const avgMood = moods.length > 0 ? Math.round(moods.reduce((sum, m) => sum + m.mood_value, 0) / moods.length) : null;
            return { time: group.label, mood: avgMood };
        }).filter(d => d.mood !== null)
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const dayMoods = moodEntries.filter(m => new Date(m.date).getDay() === index);
            const avgMood = dayMoods.length > 0 ? Math.round(dayMoods.reduce((sum, m) => sum + m.mood_value, 0) / dayMoods.length) : null;
            return { time: day, mood: avgMood };
        }).filter(d => d.mood !== null);

    // Mood Chips Analytics
    const moodChipsData = {};
    moodEntries.forEach(m => {
        if (m.mood_label) {
        moodChipsData[m.mood_label] = (moodChipsData[m.mood_label] || 0) + 1;
        }
    });
    const sortedMoodChips = Object.entries(moodChipsData).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Mindfulness Correlation
    const daysWithJournal = new Set(journalEntries.map(j => format(new Date(j.created_date), 'yyyy-MM-dd')));
    const moodWithJournal = moodEntries.filter(m => daysWithJournal.has(m.date));
    const moodWithoutJournal = moodEntries.filter(m => !daysWithJournal.has(m.date));
    const avgMoodWithJournal = moodWithJournal.length > 0 ? Math.round(moodWithJournal.reduce((sum, m) => sum + m.mood_value, 0) / moodWithJournal.length) : null;
    const avgMoodWithoutJournal = moodWithoutJournal.length > 0 ? Math.round(moodWithoutJournal.reduce((sum, m) => sum + m.mood_value, 0) / moodWithoutJournal.length) : null;

    // Mom's Mood + Baby Sleep Correlation
    const momMoodSleepData = trendDays.map(date => {
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

    // Mom's Mood + Feeding Correlation
    const momMoodFeedingData = trendDays.map(date => {
        const dayMoods = moodEntries.filter(m => m.date === date);
        const avgMood = dayMoods.length > 0 
        ? Math.round(dayMoods.reduce((sum, m) => sum + m.mood_value, 0) / dayMoods.length)
        : null;
        
        const feedings = babyActivities.filter(a => 
        ['breastfeed', 'bottle'].includes(a.type) && 
        format(new Date(a.timestamp), 'yyyy-MM-dd') === date
        );
        
        return {
        date: format(new Date(date), 'EEE'),
        feedings: feedings.length,
        mood: avgMood
        };
    }).filter(d => d.mood !== null);

    // Highest and Lowest Mood Days
    const moodsByDay = trendDays.map(date => {
        const dayMoods = moodEntries.filter(m => m.date === date);
        const avgMood = dayMoods.length > 0 ? Math.round(dayMoods.reduce((sum, m) => sum + m.mood_value, 0) / dayMoods.length) : null;
        return { date, mood: avgMood };
    }).filter(d => d.mood !== null);

    const highestDay = moodsByDay.reduce((max, d) => !max || d.mood > max.mood ? d : max, null);
    const lowestDay = moodsByDay.reduce((min, d) => !min || d.mood < min.mood ? d : min, null);
    const weekAvgMood = moodsByDay.length > 0 
        ? Math.round(moodsByDay.reduce((sum, d) => sum + d.mood, 0) / moodsByDay.length)
        : null;

    // Baby: Mood with Sleep Length
    const babyMoodSleepData = babyMoods.map(bm => {
        const date = format(new Date(bm.timestamp), 'yyyy-MM-dd');
        const naps = babyActivities.filter(a => a.type === 'nap' && format(new Date(a.timestamp), 'yyyy-MM-dd') === date);
        const totalSleepHours = naps.reduce((sum, n) => sum + (n.duration_minutes || 0), 0) / 60;
        return {
        mood: bm.mood_value,
        sleep: Math.round(totalSleepHours * 10) / 10,
        tags: bm.tags || []
        };
    }).filter(d => d.sleep > 0);

    // Baby: Mood with Sleep Time
    const babyMoodSleepTimeData = babyActivities
        .filter(a => a.type === 'nap')
        .map(nap => {
        const napTime = new Date(nap.timestamp).getHours();
        const date = format(new Date(nap.timestamp), 'yyyy-MM-dd');
        const moodsOnDay = babyMoods.filter(bm => format(new Date(bm.timestamp), 'yyyy-MM-dd') === date);
        const avgMood = moodsOnDay.length > 0 ? Math.round(moodsOnDay.reduce((sum, m) => sum + m.mood_value, 0) / moodsOnDay.length) : null;
        return {
            time: napTime,
            mood: avgMood,
            duration: nap.duration_minutes || 0
        };
        }).filter(d => d.mood !== null);

    // Baby: Average Schedule
    const feedingsByHour = Array.from({ length: 24 }, (_, hour) => {
        const feedings = babyActivities.filter(a => 
        ['breastfeed', 'bottle'].includes(a.type) && 
        new Date(a.timestamp).getHours() === hour
        );
        return {
        hour: hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour-12}pm`,
        count: feedings.length
        };
    }).filter(d => d.count > 0);

    const napsByHour = Array.from({ length: 24 }, (_, hour) => {
        const naps = babyActivities.filter(a => 
        a.type === 'nap' && 
        new Date(a.timestamp).getHours() === hour
        );
        return {
        hour: hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour-12}pm`,
        count: naps.length
        };
    }).filter(d => d.count > 0);

    // Baby: Long vs Short Naps Mood
    const babyMoodByNapLength = babyMoods.map(bm => {
        const date = format(new Date(bm.timestamp), 'yyyy-MM-dd');
        const naps = babyActivities.filter(a => a.type === 'nap' && format(new Date(a.timestamp), 'yyyy-MM-dd') === date);
        const totalNapMinutes = naps.reduce((sum, n) => sum + (n.duration_minutes || 0), 0);
        return { mood: bm.mood_value, napHours: totalNapMinutes / 60 };
    });

    const avgMoodWithLongNaps = babyMoodByNapLength.filter(d => d.napHours >= 2).length > 0
        ? Math.round(babyMoodByNapLength.filter(d => d.napHours >= 2).reduce((sum, d) => sum + d.mood, 0) / babyMoodByNapLength.filter(d => d.napHours >= 2).length)
        : null;
    const avgMoodWithShortNaps = babyMoodByNapLength.filter(d => d.napHours < 2 && d.napHours > 0).length > 0
        ? Math.round(babyMoodByNapLength.filter(d => d.napHours < 2 && d.napHours > 0).reduce((sum, d) => sum + d.mood, 0) / babyMoodByNapLength.filter(d => d.napHours < 2 && d.napHours > 0).length)
        : null;

    // Baby: Mood Tags by Time of Day
    const tagsByTime = {};
    babyMoods.forEach(bm => {
        const hour = new Date(bm.timestamp).getHours();
        const period = hour >= 6 && hour < 12 ? 'Morning' : hour >= 12 && hour < 18 ? 'Afternoon' : 'Evening';
        (bm.tags || []).forEach(tag => {
        if (!tagsByTime[tag]) tagsByTime[tag] = { Morning: 0, Afternoon: 0, Evening: 0 };
        tagsByTime[tag][period]++;
        });
    });

    return (
        <div className="space-y-6 pb-8">
        {/* MOM Section */}
        <div className="bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#4A4458]">Mom Insights</h2>
            <p className="text-sm text-[#7D7589] mt-1">Understanding your emotional patterns</p>
        </div>

        {/* Mood Trends */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#8B7A9F]" />
                <h3 className="font-semibold text-[#4A4458]">Mood Trends Over Time</h3>
            </div>
            <Select value={trendTimeframe} onValueChange={setTrendTimeframe}>
                <SelectTrigger className="w-32">
                <SelectValue />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="2weeks">2 Weeks</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                </SelectContent>
            </Select>
            </div>
            <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodTrendsData}>
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
                <p className="text-xs text-[#7D7589] mb-1">Average Mood</p>
                <p className="text-lg font-semibold text-[#4A4458]">{weekAvgMood}/100</p>
                </div>
            )}
            
            {highestDay && lowestDay && (
                <div className="p-3 bg-[#F5EEF8] rounded-xl">
                <p className="text-sm text-[#4A4458]">
                    Mood was highest on {format(new Date(highestDay.date), 'EEEE')} ({highestDay.mood}) and lowest on {format(new Date(lowestDay.date), 'EEEE')} ({lowestDay.mood}).
                </p>
                </div>
            )}
            </div>
        </div>

        {/* Mood Throughout Day/Week */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#8B7A9F]" />
                <h3 className="font-semibold text-[#4A4458]">Mood Throughout the {moodTimeView === 'day' ? 'Day' : 'Week'}</h3>
            </div>
            <Select value={moodTimeView} onValueChange={setMoodTimeView}>
                <SelectTrigger className="w-32">
                <SelectValue />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                </SelectContent>
            </Select>
            </div>
            <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4F3" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#7D7589', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#7D7589', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="mood" fill="#8B7A9F" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>

        {/* Mood Chips Analytics */}
        {sortedMoodChips.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#8B7A9F]" />
                <h3 className="font-semibold text-[#4A4458]">Most Common Feelings</h3>
            </div>
            <div className="space-y-2">
                {sortedMoodChips.map(([label, count]) => (
                <div key={label} className="flex items-center justify-between p-3 bg-[#F5EEF8] rounded-xl">
                    <span className="text-sm font-medium text-[#4A4458]">{label}</span>
                    <span className="text-sm text-[#7D7589]">{count} times</span>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Mood + Mindfulness */}
        {(avgMoodWithJournal || avgMoodWithoutJournal) && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-[#8B7A9F]" />
                <h3 className="font-semibold text-[#4A4458]">Mood + Mindfulness</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
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
                    ? `On days you journaled, your mood was ${Math.round(((avgMoodWithJournal - avgMoodWithoutJournal) / avgMoodWithoutJournal) * 100)}% higher on average.`
                    : 'You tend to journal more on lower-mood days.'}
                </p>
                </div>
            )}
            </div>
        )}

        {/* Mom's Mood + Baby Sleep Correlation */}
        {momMoodSleepData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Moon className="w-5 h-5 text-[#8B7A9F]" />
                <h3 className="font-semibold text-[#4A4458]">Your Mood + Baby's Sleep</h3>
            </div>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4F3" />
                    <XAxis dataKey="sleep" name="Baby Sleep (hrs)" tick={{ fill: '#7D7589', fontSize: 12 }} />
                    <YAxis dataKey="mood" name="Your Mood" domain={[0, 100]} tick={{ fill: '#7D7589', fontSize: 12 }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={momMoodSleepData} fill="#EDD9E8" />
                </ScatterChart>
                </ResponsiveContainer>
            </div>
            </div>
        )}

        {/* Mom's Mood + Feeding Correlation */}
        {momMoodFeedingData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Droplets className="w-5 h-5 text-[#8B7A9F]" />
                <h3 className="font-semibold text-[#4A4458]">Your Mood + Feedings</h3>
            </div>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4F3" />
                    <XAxis dataKey="feedings" name="Daily Feedings" tick={{ fill: '#7D7589', fontSize: 12 }} />
                    <YAxis dataKey="mood" name="Your Mood" domain={[0, 100]} tick={{ fill: '#7D7589', fontSize: 12 }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={momMoodFeedingData} fill="#D9EEF2" />
                </ScatterChart>
                </ResponsiveContainer>
            </div>
            </div>
        )}

        {/* BABY Section */}
        <div className="bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] rounded-3xl p-6 shadow-sm mt-8">
            <h2 className="text-xl font-semibold text-[#4A4458]">Baby Insights</h2>
            <p className="text-sm text-[#7D7589] mt-1">Discovering patterns in baby's rhythms</p>
        </div>

        {/* Baby: Mood with Sleep Length */}
        {babyMoodSleepData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Moon className="w-5 h-5 text-[#8B7A9F]" />
                <h3 className="font-semibold text-[#4A4458]">Baby Mood vs Sleep Length</h3>
            </div>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4F3" />
                    <XAxis dataKey="sleep" name="Sleep (hrs)" tick={{ fill: '#7D7589', fontSize: 12 }} />
                    <YAxis dataKey="mood" name="Mood" domain={[0, 100]} tick={{ fill: '#7D7589', fontSize: 12 }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={babyMoodSleepData} fill="#8B7A9F" />
                </ScatterChart>
                </ResponsiveContainer>
            </div>
            </div>
        )}

        {/* Baby: Average Feeding Schedule */}
        {feedingsByHour.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Droplets className="w-5 h-5 text-[#8B7A9F]" />
                <h3 className="font-semibold text-[#4A4458]">Average Feeding Schedule</h3>
            </div>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedingsByHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4F3" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fill: '#7D7589', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#7D7589', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#EDD9E8" radius={[8, 8, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
        )}

        {/* Baby: Average Nap Schedule */}
        {napsByHour.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Moon className="w-5 h-5 text-[#8B7A9F]" />
                <h3 className="font-semibold text-[#4A4458]">Average Nap Schedule</h3>
            </div>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={napsByHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4F3" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fill: '#7D7589', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#7D7589', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#D9EEF2" radius={[8, 8, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
        )}

        {/* Baby: Long vs Short Naps */}
        {(avgMoodWithLongNaps || avgMoodWithShortNaps) && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Moon className="w-5 h-5 text-[#8B7A9F]" />
                <h3 className="font-semibold text-[#4A4458]">Baby Mood by Nap Length</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
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

        {/* Baby: Mood Tags by Time */}
        {Object.keys(tagsByTime).length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#8B7A9F]" />
                <h3 className="font-semibold text-[#4A4458]">Baby Mood Tags by Time of Day</h3>
            </div>
            <div className="space-y-3">
                {Object.entries(tagsByTime).slice(0, 5).map(([tag, times]) => (
                <div key={tag} className="p-4 bg-[#F5EEF8] rounded-xl">
                    <p className="font-medium text-[#4A4458] mb-2 capitalize">{tag}</p>
                    <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                        <p className="text-xs text-[#7D7589]">Morning</p>
                        <p className="text-sm font-semibold text-[#4A4458]">{times.Morning}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-[#7D7589]">Afternoon</p>
                        <p className="text-sm font-semibold text-[#4A4458]">{times.Afternoon}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-[#7D7589]">Evening</p>
                        <p className="text-sm font-semibold text-[#4A4458]">{times.Evening}</p>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}
        </div>
    );
    }