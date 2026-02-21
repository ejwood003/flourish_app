import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Smile, Baby, BookOpen, Milk, Moon, Droplet, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
breastfeed: Baby,
bottle: Milk,
pump: Droplet,
nap: Moon,
diaper: Droplet,
other: MoreHorizontal,
};

const colorMap = {
breastfeed: 'bg-[#EDD9E8] text-[#B8A5C4]',
bottle: 'bg-[#E8E4F3] text-[#8B7A9F]',
pump: 'bg-[#D9EEF2] text-[#7AA5B8]',
nap: 'bg-[#D9EEF2] text-[#7AA5B8]',
diaper: 'bg-[#F5E6EA] text-[#B8A5C4]',
other: 'bg-[#F5F5F5] text-[#7D7589]',
};

export default function CalendarDayDetail() {
const navigate = useNavigate();
const params = new URLSearchParams(window.location.search);
const dateStr = params.get('date');
const type = params.get('type'); // 'mood', 'baby', or 'journal'
const selectedDate = dateStr ? new Date(dateStr) : new Date();

const { data: moodEntries = [] } = useQuery({
queryKey: ['moodEntries'],
queryFn: () => base44.entities.MoodEntry.list('-date', 100),
});

const { data: babyActivities = [] } = useQuery({
queryKey: ['babyActivitiesDetail'],
queryFn: () => base44.entities.BabyActivity.list('-timestamp', 200),
});

const { data: journalEntries = [] } = useQuery({
queryKey: ['journalEntriesDetail'],
queryFn: () => base44.entities.JournalEntry.list('-created_date', 100),
});

const getMoodForDate = (date) => {
const dateStr = format(date, 'yyyy-MM-dd');
return moodEntries.find(m => m.date === dateStr);
};

const getActivitiesForDate = (date) => {
return babyActivities.filter(a => 
    isSameDay(new Date(a.timestamp), date)
).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const getJournalEntriesForDate = (date) => {
return journalEntries.filter(j => 
    isSameDay(new Date(j.created_date), date)
).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
};

const selectedMood = getMoodForDate(selectedDate);
const selectedActivities = getActivitiesForDate(selectedDate);
const selectedJournals = getJournalEntriesForDate(selectedDate);

return (
<div className="space-y-6 pb-8">
    <div className="flex items-center gap-3 mb-2">
    <button
        onClick={() => navigate(createPageUrl('Calendar'))}
        className="p-2 rounded-xl hover:bg-[#E8E4F3] transition-colors"
    >
        <ArrowLeft className="w-5 h-5 text-[#8B7A9F]" />
    </button>
    <div>
        <h1 className="text-2xl font-semibold text-[#4A4458]">
        {format(selectedDate, 'MMMM d, yyyy')}
        </h1>
        <p className="text-[#7D7589] text-sm">{format(selectedDate, 'EEEE')}</p>
    </div>
    </div>

    {/* Mood Detail */}
    {(type === 'mood' || !type) && selectedMood && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#EDD9E8] to-[#F5E6EA] rounded-3xl p-6 shadow-sm"
    >
        <div className="flex items-center gap-3 mb-4">
        <Smile className="w-6 h-6 text-[#8B7A9F]" />
        <h2 className="text-lg font-semibold text-[#4A4458]">Mood Check-In</h2>
        </div>
        <div className="bg-white/50 rounded-2xl p-4">
        <p className="text-sm text-[#7D7589] mb-2">Mood Rating</p>
        <p className="text-3xl font-bold text-[#4A4458]">{selectedMood.mood_value}/100</p>
        </div>
    </motion.div>
    )}

    {/* Baby Activities Detail */}
    {(type === 'baby' || !type) && selectedActivities.length > 0 && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-sm"
    >
        <div className="flex items-center gap-3 mb-4">
        <Baby className="w-6 h-6 text-[#8B7A9F]" />
        <h2 className="text-lg font-semibold text-[#4A4458]">Baby Activities</h2>
        </div>
        <div className="space-y-3">
        {selectedActivities.map((activity, index) => {
            const Icon = iconMap[activity.type] || MoreHorizontal;
            return (
            <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-4 bg-[#FEF9F5] rounded-2xl"
            >
                <div className={`p-2 rounded-xl ${colorMap[activity.type]} flex-shrink-0`}>
                <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2 mb-2">
                    <p className="font-semibold text-[#4A4458] capitalize">
                    {activity.type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-[#7D7589]">
                    {format(new Date(activity.timestamp), 'h:mm a')}
                    </p>
                </div>
                {(activity.duration_minutes || activity.breast_side || activity.amount_oz) && (
                    <div className="flex flex-wrap gap-2 mb-2">
                    {activity.duration_minutes && (
                        <span className="text-xs bg-[#E8E4F3] px-2 py-1 rounded-full text-[#7D7589]">
                        {activity.duration_minutes} min
                        </span>
                    )}
                    {activity.breast_side && (
                        <span className="text-xs bg-[#EDD9E8] px-2 py-1 rounded-full text-[#7D7589] capitalize">
                        {activity.breast_side}
                        </span>
                    )}
                    {activity.amount_oz && (
                        <span className="text-xs bg-[#D9EEF2] px-2 py-1 rounded-full text-[#7D7589]">
                        {activity.amount_oz} oz
                        </span>
                    )}
                    </div>
                )}
                {activity.notes && (
                    <p className="text-sm text-[#7D7589] italic">"{activity.notes}"</p>
                )}
                </div>
            </motion.div>
            );
        })}
        </div>
    </motion.div>
    )}

    {/* Journal Entries Detail */}
    {(type === 'journal' || !type) && selectedJournals.length > 0 && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-sm"
    >
        <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-6 h-6 text-[#8B7A9F]" />
        <h2 className="text-lg font-semibold text-[#4A4458]">Journal Entries</h2>
        </div>
        <div className="space-y-4">
        {selectedJournals.map((entry, index) => (
            <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-gradient-to-br from-[#E8E4F3] to-[#F0EDF7] rounded-2xl"
            >
            <p className="text-sm text-[#7D7589] mb-2">
                {format(new Date(entry.created_date), 'h:mm a')}
            </p>
            {entry.prompt && (
                <p className="text-sm text-[#8B7A9F] italic mb-2">"{entry.prompt}"</p>
            )}
            <p className="text-[#4A4458] leading-relaxed whitespace-pre-wrap">
                {entry.content}
            </p>
            </motion.div>
        ))}
        </div>
    </motion.div>
    )}

    {/* No entries */}
    {!selectedMood && selectedActivities.length === 0 && selectedJournals.length === 0 && (
    <div className="text-center py-12 bg-white rounded-3xl">
        <p className="text-[#7D7589]">No entries for this day</p>
    </div>
    )}
</div>
);
}