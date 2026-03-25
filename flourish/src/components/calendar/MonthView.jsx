import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const getMoodColor = (value) => {
    if (value <= 20) return 'bg-[#E8E4F3]';
    if (value <= 40) return 'bg-[#EDD9E8]';
    if (value <= 60) return 'bg-[#F5EEF8]';
    if (value <= 80) return 'bg-[#D9EEF2]';
    return 'bg-[#DCEAF0]';
};

export default function MonthView({
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    moodEntries,
}) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getMoodsForDate = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return moodEntries.filter((m) => (m.date ?? m.Date) === dateStr);
    };

    const moodNumeric = (m) => {
        const v = m?.mood_value ?? m?.MoodValue;
        const n = typeof v === 'number' ? v : parseInt(v, 10);
        return Number.isFinite(n) ? n : 0;
    };

    const getAverageMood = (moods) => {
        if (moods.length === 0) return null;
        return Math.round(
            moods.reduce((sum, m) => sum + moodNumeric(m), 0) / moods.length,
        );
    };

    return (
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
                    <div key={day} className="text-center text-xs font-medium text-[#5A4B70] py-2">
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
                                    ? 'bg-[#7D6F99] text-white'
                                    : isTodayDate
                                    ? 'bg-[#7D6F99] text-white text-bold]'
                                    : 'hover:bg-[#E8E4F3]/50 text-[#4A4458] '
                            }`}
                        >
                            <div className="text-sm font-medium">{format(day, 'd')}</div>

                            {avgMood !== null && (
                                <div
                                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${
                                        isSelected ? 'bg-white/60' : getMoodColor(avgMood)
                                    }`}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}