import { format, subDays, parse, isValid } from 'date-fns';
import { Heart, Moon, Droplets, Sparkles, Clock, Brain } from 'lucide-react';
import {LineChart,Line,BarChart,Bar,ScatterChart,Scatter,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer} from 'recharts';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import { journalEntryCreatedAt } from '@/lib/journalEntryFields';
import {
    babyActivityTimestamp,
    babyActivityType,
    babyActivityDurationMinutes,
} from '@/lib/babyEntityFields';

function moodEntryValue(m) {
    if (!m) return 0;
    const v = m.mood_value ?? m.MoodValue;
    return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
}

function moodEntryDate(m) {
    if (!m) return '';
    return m.date ?? m.Date ?? '';
}

function moodEntryTime(m) {
    return m.time ?? m.Time ?? '';
}

function moodEntryLabel(m) {
    return m.mood_label ?? m.MoodLabel;
}

function activityDateKey(a) {
    const ts = babyActivityTimestamp(a);
    if (ts == null) return null;
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? null : format(d, 'yyyy-MM-dd');
}

export default function MomInsights({
    moodEntries = [],
    journalEntries = [],
    babyActivities = [],
    moodTimeView,
    setMoodTimeView,
    trendTimeframe,
    setTrendTimeframe,
}) {
    const getTrendDays = () => {
        if (trendTimeframe === 'week') return 7;
        if (trendTimeframe === '2weeks') return 14;
        return 30;
    };

    const trendDays = Array.from({ length: getTrendDays() }, (_, i) => {
        const date = subDays(new Date(), getTrendDays() - 1 - i);
        return format(date, 'yyyy-MM-dd');
    });

    const moodTrendsData = trendDays.map(date => {
        const dayMoods = moodEntries.filter(m => moodEntryDate(m) === date);
        const avgMood = dayMoods.length > 0
            ? Math.round(dayMoods.reduce((sum, m) => sum + moodEntryValue(m), 0) / dayMoods.length)
            : null;

        return {
            date: trendTimeframe === 'week'
                ? format(new Date(date), 'EEE')
                : format(new Date(date), 'MM/dd'),
            mood: avgMood
        };
    });

    const moodTimeData = moodTimeView === 'day'
        ? [
            { label: 'Morning', hours: [6, 7, 8, 9, 10, 11] },
            { label: 'Afternoon', hours: [12, 13, 14, 15, 16, 17] },
            { label: 'Evening', hours: [18, 19, 20, 21, 22, 23] }
        ].map(group => {
            const moods = moodEntries.filter(m => {
                const t = moodEntryTime(m);
                if (!t) return false;
                const h = parseInt(String(t).split(':')[0], 10);
                return !Number.isNaN(h) && group.hours.includes(h);
            });
            const avgMood = moods.length > 0
                ? Math.round(moods.reduce((sum, m) => sum + moodEntryValue(m), 0) / moods.length)
                : null;

            return { time: group.label, mood: avgMood };
        }).filter(d => d.mood !== null)
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayLabel, index) => {
            const dayMoods = moodEntries.filter(m => {
                const dStr = moodEntryDate(m);
                if (!dStr) return false;
                const local = parse(dStr, 'yyyy-MM-dd', new Date());
                return isValid(local) && local.getDay() === index;
            });
            const avgMood = dayMoods.length > 0
                ? Math.round(dayMoods.reduce((sum, m) => sum + moodEntryValue(m), 0) / dayMoods.length)
                : null;

            return { time: dayLabel, mood: avgMood };
        }).filter(d => d.mood !== null);

    const moodChipsData = {};
    moodEntries.forEach(m => {
        const label = moodEntryLabel(m);
        if (label) {
            moodChipsData[label] = (moodChipsData[label] || 0) + 1;
        }
    });

    const sortedMoodChips = Object.entries(moodChipsData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const daysWithJournal = new Set(
        journalEntries
            .map(j => {
                const d = journalEntryCreatedAt(j);
                return d ? format(d, 'yyyy-MM-dd') : null;
            })
            .filter(Boolean)
    );

    const moodWithJournal = moodEntries.filter(m => daysWithJournal.has(moodEntryDate(m)));
    const moodWithoutJournal = moodEntries.filter(m => !daysWithJournal.has(moodEntryDate(m)));

    const avgMoodWithJournal = moodWithJournal.length > 0
        ? Math.round(moodWithJournal.reduce((sum, m) => sum + moodEntryValue(m), 0) / moodWithJournal.length)
        : null;

    const avgMoodWithoutJournal = moodWithoutJournal.length > 0
        ? Math.round(moodWithoutJournal.reduce((sum, m) => sum + moodEntryValue(m), 0) / moodWithoutJournal.length)
        : null;

    const momMoodSleepData = trendDays.map(date => {
        const dayMoods = moodEntries.filter(m => moodEntryDate(m) === date);
        const avgMood = dayMoods.length > 0
            ? Math.round(dayMoods.reduce((sum, m) => sum + moodEntryValue(m), 0) / dayMoods.length)
            : null;

        const naps = babyActivities.filter(
            a => babyActivityType(a) === 'nap' && activityDateKey(a) === date
        );

        const totalSleep = naps.reduce((sum, n) => sum + babyActivityDurationMinutes(n), 0) / 60;

        return {
            date: format(new Date(date), 'EEE'),
            sleep: Math.round(totalSleep * 10) / 10,
            mood: avgMood
        };
    }).filter(d => d.mood !== null);

    const momMoodFeedingData = trendDays.map(date => {
        const dayMoods = moodEntries.filter(m => moodEntryDate(m) === date);
        const avgMood = dayMoods.length > 0
            ? Math.round(dayMoods.reduce((sum, m) => sum + moodEntryValue(m), 0) / dayMoods.length)
            : null;

        const feedings = babyActivities.filter(
            a =>
                ['breastfeed', 'bottle'].includes(babyActivityType(a)) &&
                activityDateKey(a) === date
        );

        return {
            date: format(new Date(date), 'EEE'),
            feedings: feedings.length,
            mood: avgMood
        };
    }).filter(d => d.mood !== null);

    const moodsByDay = trendDays.map(date => {
        const dayMoods = moodEntries.filter(m => moodEntryDate(m) === date);
        const avgMood = dayMoods.length > 0
            ? Math.round(dayMoods.reduce((sum, m) => sum + moodEntryValue(m), 0) / dayMoods.length)
            : null;

        return { date, mood: avgMood };
    }).filter(d => d.mood !== null);

    const highestDay = moodsByDay.reduce(
        (max, d) => (!max || d.mood > max.mood ? d : max),
        null
    );

    const lowestDay = moodsByDay.reduce(
        (min, d) => (!min || d.mood < min.mood ? d : min),
        null
    );

    const weekAvgMood = moodsByDay.length > 0
        ? Math.round(moodsByDay.reduce((sum, d) => sum + d.mood, 0) / moodsByDay.length)
        : null;

    return (
        <>
            <div className="bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#4A4458]">Mom Insights</h2>
                <p className="text-sm text-[#5A4B70] mt-1">Understanding your emotional patterns</p>
            </div>

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
                            <XAxis dataKey="date" tick={{ fill: '#5A4B70', fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#5A4B70', fontSize: 12 }} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="mood"
                                stroke="#8B7A9F"
                                strokeWidth={3}
                                dot={{ fill: '#8B7A9F', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                    {weekAvgMood && (
                        <div className="p-3 bg-[#F5EEF8] rounded-xl">
                            <p className="text-xs text-[#5A4B70] mb-1">Average Mood</p>
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

            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#8B7A9F]" />
                        <h3 className="font-semibold text-[#4A4458]">
                            Mood Throughout the {moodTimeView === 'day' ? 'Day' : 'Week'}
                        </h3>
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
                            <XAxis dataKey="time" tick={{ fill: '#5A4B70', fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#5A4B70', fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="mood" fill="#8B7A9F" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

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
                                <span className="text-sm text-[#5A4B70]">{count} times</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(avgMoodWithJournal || avgMoodWithoutJournal) && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-[#8B7A9F]" />
                        <h3 className="font-semibold text-[#4A4458]">Mood + Mindfulness</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {avgMoodWithJournal && (
                            <div className="p-4 bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] rounded-xl">
                                <p className="text-xs text-[#5A4B70] mb-1">With Journaling</p>
                                <p className="text-2xl font-semibold text-[#4A4458]">{avgMoodWithJournal}</p>
                            </div>
                        )}
                        {avgMoodWithoutJournal && (
                            <div className="p-4 bg-[#F5EEF8] rounded-xl">
                                <p className="text-xs text-[#5A4B70] mb-1">Without Journaling</p>
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

            {momMoodSleepData.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Moon className="w-5 h-5 text-[#8B7A9F]" />
                        <h3 className="font-semibold text-[#4A4458]">Your Mood + Baby&apos;s Sleep</h3>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4F3" />
                                <XAxis dataKey="sleep" name="Baby Sleep (hrs)" tick={{ fill: '#5A4B70', fontSize: 12 }} />
                                <YAxis dataKey="mood" name="Your Mood" domain={[0, 100]} tick={{ fill: '#5A4B70', fontSize: 12 }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter data={momMoodSleepData} fill="#EDD9E8" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

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
                                <XAxis dataKey="feedings" name="Daily Feedings" tick={{ fill: '#5A4B70', fontSize: 12 }} />
                                <YAxis dataKey="mood" name="Your Mood" domain={[0, 100]} tick={{ fill: '#5A4B70', fontSize: 12 }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter data={momMoodFeedingData} fill="#D9EEF2" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </>
    );
}