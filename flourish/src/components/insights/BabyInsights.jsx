import { format } from 'date-fns';
import { Moon, Droplets, TrendingUp } from 'lucide-react';
import {
    BarChart,
    Bar,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function BabyInsights({ babyActivities, babyMoods }) {
    const babyMoodSleepData = babyMoods.map(bm => {
        const date = format(new Date(bm.timestamp), 'yyyy-MM-dd');
        const naps = babyActivities.filter(
            a => a.type === 'nap' && format(new Date(a.timestamp), 'yyyy-MM-dd') === date
        );
        const totalSleepHours = naps.reduce((sum, n) => sum + (n.duration_minutes || 0), 0) / 60;

        return {
            mood: bm.mood_value,
            sleep: Math.round(totalSleepHours * 10) / 10,
            tags: bm.tags || []
        };
    }).filter(d => d.sleep > 0);

    const feedingsByHour = Array.from({ length: 24 }, (_, hour) => {
        const feedings = babyActivities.filter(
            a =>
                ['breastfeed', 'bottle'].includes(a.type) &&
                new Date(a.timestamp).getHours() === hour
        );

        return {
            hour: hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`,
            count: feedings.length
        };
    }).filter(d => d.count > 0);

    const napsByHour = Array.from({ length: 24 }, (_, hour) => {
        const naps = babyActivities.filter(
            a => a.type === 'nap' && new Date(a.timestamp).getHours() === hour
        );

        return {
            hour: hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`,
            count: naps.length
        };
    }).filter(d => d.count > 0);

    const babyMoodByNapLength = babyMoods.map(bm => {
        const date = format(new Date(bm.timestamp), 'yyyy-MM-dd');
        const naps = babyActivities.filter(
            a => a.type === 'nap' && format(new Date(a.timestamp), 'yyyy-MM-dd') === date
        );
        const totalNapMinutes = naps.reduce((sum, n) => sum + (n.duration_minutes || 0), 0);

        return { mood: bm.mood_value, napHours: totalNapMinutes / 60 };
    });

    const longNaps = babyMoodByNapLength.filter(d => d.napHours >= 2);
    const shortNaps = babyMoodByNapLength.filter(d => d.napHours < 2 && d.napHours > 0);

    const avgMoodWithLongNaps = longNaps.length > 0
        ? Math.round(longNaps.reduce((sum, d) => sum + d.mood, 0) / longNaps.length)
        : null;

    const avgMoodWithShortNaps = shortNaps.length > 0
        ? Math.round(shortNaps.reduce((sum, d) => sum + d.mood, 0) / shortNaps.length)
        : null;

    const tagsByTime = {};
    babyMoods.forEach(bm => {
        const hour = new Date(bm.timestamp).getHours();
        const period =
            hour >= 6 && hour < 12
                ? 'Morning'
                : hour >= 12 && hour < 18
                    ? 'Afternoon'
                    : 'Evening';

        (bm.tags || []).forEach(tag => {
            if (!tagsByTime[tag]) {
                tagsByTime[tag] = { Morning: 0, Afternoon: 0, Evening: 0 };
            }
            tagsByTime[tag][period]++;
        });
    });

    return (
        <>
            <div className="bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] rounded-3xl p-6 shadow-sm mt-8">
                <h2 className="text-xl font-semibold text-[#4A4458]">Baby Insights</h2>
                <p className="text-sm text-[#5A4B70] mt-1">Discovering patterns in baby&apos;s rhythms</p>
            </div>

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
                                <XAxis dataKey="sleep" name="Sleep (hrs)" tick={{ fill: '#5A4B70', fontSize: 12 }} />
                                <YAxis dataKey="mood" name="Mood" domain={[0, 100]} tick={{ fill: '#5A4B70', fontSize: 12 }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter data={babyMoodSleepData} fill="#8B7A9F" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

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
                                <XAxis dataKey="hour" tick={{ fill: '#5A4B70', fontSize: 10 }} />
                                <YAxis tick={{ fill: '#5A4B70', fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#EDD9E8" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

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
                                <XAxis dataKey="hour" tick={{ fill: '#5A4B70', fontSize: 10 }} />
                                <YAxis tick={{ fill: '#5A4B70', fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#D9EEF2" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {(avgMoodWithLongNaps || avgMoodWithShortNaps) && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Moon className="w-5 h-5 text-[#8B7A9F]" />
                        <h3 className="font-semibold text-[#4A4458]">Baby Mood by Nap Length</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {avgMoodWithLongNaps && (
                            <div className="p-4 bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] rounded-xl">
                                <p className="text-xs text-[#5A4B70] mb-1">Long Naps (2+ hrs)</p>
                                <p className="text-2xl font-semibold text-[#4A4458]">{avgMoodWithLongNaps}</p>
                            </div>
                        )}
                        {avgMoodWithShortNaps && (
                            <div className="p-4 bg-[#F5EEF8] rounded-xl">
                                <p className="text-xs text-[#5A4B70] mb-1">Short Naps (&lt;2 hrs)</p>
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
                                        <p className="text-xs text-[#5A4B70]">Morning</p>
                                        <p className="text-sm font-semibold text-[#4A4458]">{times.Morning}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-[#5A4B70]">Afternoon</p>
                                        <p className="text-sm font-semibold text-[#4A4458]">{times.Afternoon}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-[#5A4B70]">Evening</p>
                                        <p className="text-sm font-semibold text-[#4A4458]">{times.Evening}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}