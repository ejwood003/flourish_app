import React, { useState } from 'react';
import { format, startOfWeek, addDays, isToday, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths, addMinutes, differenceInMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, Milk, Baby, Moon, MoreHorizontal, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';

const iconMap = {
    breastfeed: Baby,
    bottle: Milk,
    nap: Moon,
    other: MoreHorizontal,
};

const colorMap = {
    breastfeed: { bg: 'bg-[#EDD9E8]', text: 'text-[#B8A5C4]', dot: 'bg-[#EDD9E8]' },
    bottle: { bg: 'bg-[#E8E4F3]', text: 'text-[#8B7A9F]', dot: 'bg-[#E8E4F3]' },
    nap: { bg: 'bg-[#D9EEF2]', text: 'text-[#7AA5B8]', dot: 'bg-[#D9EEF2]' },
    other: { bg: 'bg-[#F5F5F5]', text: 'text-[#7D7589]', dot: 'bg-[#F5F5F5]' },
};

const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'feeding', label: 'Feeding', types: ['breastfeed', 'bottle'] },
    { id: 'nap', label: 'Nap', types: ['nap'] },
    { id: 'other', label: 'Other', types: ['other'] },
];

export default function HistorySection({ activities, onEditActivity }) {
    const queryClient = useQueryClient();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filter, setFilter] = useState('all');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

    const handleDelete = async () => {
        try {
        await base44.entities.BabyActivity.delete(deleteDialog.id);
        queryClient.invalidateQueries({ queryKey: ['babyActivities'] });
        } catch (error) {
        console.error('Error deleting activity:', error);
        }
        setDeleteDialog({ open: false, id: null });
    };

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const getActivitiesForDate = (date) => {
        return activities.filter(a => isSameDay(new Date(a.timestamp), date));
    };

    const getActivityTypes = (date) => {
        const dayActivities = getActivitiesForDate(date);
        const types = new Set(dayActivities.map(a => a.type));
        return Array.from(types);
    };

    const getFilteredTimeline = () => {
        const dayActivities = getActivitiesForDate(selectedDate);
        if (filter === 'all') return dayActivities;
        
        const filterConfig = filterOptions.find(f => f.id === filter);
        if (filterConfig?.types) {
        return dayActivities.filter(a => filterConfig.types.includes(a.type));
        }
        return dayActivities;
    };

    const calculateNextFeeding = () => {
        const feedings = activities
        .filter(a => ['breastfeed', 'bottle'].includes(a.type))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

        if (feedings.length < 2) return null;

        let totalMinutes = 0;
        for (let i = 0; i < feedings.length - 1; i++) {
        const diff = differenceInMinutes(
            new Date(feedings[i].timestamp),
            new Date(feedings[i + 1].timestamp)
        );
        totalMinutes += diff;
        }
        const avgMinutes = Math.round(totalMinutes / (feedings.length - 1));

        if (feedings[0]) {
        return addMinutes(new Date(feedings[0].timestamp), avgMinutes);
        }
        return null;
    };

    const calculateNextNap = () => {
        const naps = activities
        .filter(a => a.type === 'nap')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

        if (naps.length < 2) return null;

        let totalMinutes = 0;
        for (let i = 0; i < naps.length - 1; i++) {
        const diff = differenceInMinutes(
            new Date(naps[i].timestamp),
            new Date(naps[i + 1].timestamp)
        );
        totalMinutes += diff;
        }
        const avgMinutes = Math.round(totalMinutes / (naps.length - 1));

        if (naps[0]) {
        return addMinutes(new Date(naps[0].timestamp), avgMinutes);
        }
        return null;
    };

    const getFutureEstimates = () => {
        const estimates = [];
        
        // Get average intervals
        const feedings = activities
        .filter(a => ['breastfeed', 'bottle'].includes(a.type))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

        const naps = activities
        .filter(a => a.type === 'nap')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

        // Calculate feeding interval
        let feedingInterval = null;
        if (feedings.length >= 2) {
        let totalMinutes = 0;
        for (let i = 0; i < feedings.length - 1; i++) {
            const diff = differenceInMinutes(
            new Date(feedings[i].timestamp),
            new Date(feedings[i + 1].timestamp)
            );
            totalMinutes += diff;
        }
        feedingInterval = Math.round(totalMinutes / (feedings.length - 1));
        }

        // Calculate nap interval
        let napInterval = null;
        if (naps.length >= 2) {
        let totalMinutes = 0;
        for (let i = 0; i < naps.length - 1; i++) {
            const diff = differenceInMinutes(
            new Date(naps[i].timestamp),
            new Date(naps[i + 1].timestamp)
            );
            totalMinutes += diff;
        }
        napInterval = Math.round(totalMinutes / (naps.length - 1));
        }

        // Generate estimates for next 3 days
        const now = new Date();
        let currentFeedingTime = feedings[0] ? new Date(feedings[0].timestamp) : now;
        let currentNapTime = naps[0] ? new Date(naps[0].timestamp) : now;

        // Only show estimates for selected date if it's today or future
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        const threeDaysLater = addDays(new Date(), 3);

        if (feedingInterval && selectedDate >= startOfWeek(new Date()) && selectedDate <= threeDaysLater) {
        for (let i = 0; i < 10; i++) {
            currentFeedingTime = addMinutes(currentFeedingTime, feedingInterval);
            if (isSameDay(currentFeedingTime, selectedDate) && currentFeedingTime > now) {
            estimates.push({
                id: `est-feed-${i}`,
                type: 'bottle',
                timestamp: currentFeedingTime.toISOString(),
                isEstimate: true
            });
            }
        }
        }

        if (napInterval && selectedDate >= startOfWeek(new Date()) && selectedDate <= threeDaysLater) {
        for (let i = 0; i < 10; i++) {
            currentNapTime = addMinutes(currentNapTime, napInterval);
            if (isSameDay(currentNapTime, selectedDate) && currentNapTime > now) {
            estimates.push({
                id: `est-nap-${i}`,
                type: 'nap',
                timestamp: currentNapTime.toISOString(),
                isEstimate: true
            });
            }
        }
        }

        return estimates;
    };

    const actualTimeline = getFilteredTimeline().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const futureEstimates = getFutureEstimates();
    const timeline = [...actualTimeline, ...futureEstimates].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const handlePrevWeek = () => {
        setWeekStart(addDays(weekStart, -7));
    };

    const handleNextWeek = () => {
        setWeekStart(addDays(weekStart, 7));
    };

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
        <p className="text-xs font-medium text-[#5A4B70] mb-4 uppercase tracking-wide">
            History
        </p>

        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-[#F5EEF8] rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#8B7A9F]" />
            </button>
            <p className="text-lg font-semibold text-[#4A4458]">
                {format(currentMonth, 'MMMM yyyy')}
            </p>
            <button onClick={handleNextMonth} className="p-2 hover:bg-[#F5EEF8] rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-[#8B7A9F]" />
            </button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevWeek} className="p-1 hover:bg-[#F5EEF8] rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-[#8B7A9F]" />
            </button>
            <div className="flex-1 grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
                const types = getActivityTypes(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);
                
                return (
                <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center py-2 rounded-xl transition-all ${
                    isSelected ? 'bg-[#7D6F99] text-white' : 'hover:bg-[#F5EEF8]'
                    }`}
                >
                    <span className={`text-xs ${isSelected ? 'text-white' : 'text-[#5A4B70]'}`}>
                        {format(day, 'EEE')}
                    </span>
                    <span className={`text-sm font-semibold mt-1 ${
                    isSelected ? 'text-white' : isCurrentDay ? 'text-[#8B7A9F]' : 'text-[#4A4458]'
                    } ${isCurrentDay && !isSelected ? 'border-b-2 border-[#8B7A9F]' : ''}`}>
                    {format(day, 'd')}
                    </span>
                    <div className="flex gap-1 mt-1">
                    {types.slice(0, 3).map((type, i) => (
                        <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : colorMap[type]?.dot || 'bg-gray-300'
                        }`}
                        />
                    ))}
                    </div>
                </button>
                );
            })}
            </div>
            <button onClick={handleNextWeek} className="p-1 hover:bg-[#F5EEF8] rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-[#8B7A9F]" />
            </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 p-1 bg-[#F5EEF8] rounded-xl">
            {filterOptions.map((option) => (
            <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === option.id
                    ? 'bg-white text-[#4A4458] shadow-sm'
                    : 'text-[#5A4B70]'
                }`}
            >
                {option.label}
            </button>
            ))}
        </div>

        {/* Timeline */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
            {timeline.length === 0 ? (
            <p className="text-center text-[#7D7589] py-8">
                No activities on {format(selectedDate, 'MMM d')}
            </p>
            ) : (
            timeline.map((activity) => {
                const Icon = iconMap[activity.type] || MoreHorizontal;
                const colors = colorMap[activity.type] || colorMap.other;
                const isEstimate = activity.isEstimate;
                
                return (
                <div
                    key={activity.id}
                    className={`flex items-start gap-3 w-full group ${isEstimate ? 'opacity-40' : ''}`}
                >
                    <button
                    onClick={() => !isEstimate && onEditActivity && onEditActivity(activity)}
                    disabled={isEstimate}
                    className={`flex items-start gap-3 flex-1 text-left ${!isEstimate ? 'hover:bg-[#F5EEF8] rounded-xl p-2 -m-2 transition-colors' : ''}`}
                    >
                    <div className={`p-2 rounded-xl ${colors.bg} flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                        <p className={`font-medium capitalize text-sm ${isEstimate ? 'text-[#5A4B70]' : 'text-[#5A4B70]'}`}>
                            {isEstimate && 'Estimated '}
                            {activity.type === 'breastfeed' ? 'Breastfeeding' : 
                            activity.type === 'bottle' ? 'Bottle' : 
                            activity.custom_type || activity.type}
                        </p>
                        <p className="text-xs text-[#5A4B70] flex-shrink-0">
                            {format(new Date(activity.timestamp), 'h:mm a')}
                        </p>
                        </div>
                    {!isEstimate && (
                        <>
                        <div className="text-xs text-[#5A4B70] mt-1 flex flex-wrap gap-2">
                            {activity.duration_minutes && (
                            <span className="bg-[#E8E4F3]/50 px-2 py-0.5 rounded-full">
                                {activity.duration_minutes} min
                            </span>
                            )}
                            {activity.breast_side && (
                            <span className="bg-[#EDD9E8]/50 px-2 py-0.5 rounded-full capitalize">
                                {activity.breast_side}
                            </span>
                            )}
                            {activity.amount_oz && (
                            <span className="bg-[#D9EEF2]/50 px-2 py-0.5 rounded-full">
                                {activity.amount_oz} oz
                            </span>
                            )}
                            {activity.food_type && (
                            <span className="bg-[#F5E6EA]/50 px-2 py-0.5 rounded-full">
                                {activity.food_type}
                            </span>
                            )}
                        </div>
                        {activity.notes && (
                            <p className="text-xs text-[#7D7589] mt-1.5 italic">"{activity.notes}"</p>
                        )}
                        </>
                    )}
                    </div>
                    </button>
                    {!isEstimate && (
                    <button
                        onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialog({ open: true, id: activity.id });
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#F5E6EA] rounded-lg transition-all self-start mt-1"
                    >
                        <Trash2 className="w-4 h-4 text-[#8B4A4A]" />
                    </button>
                    )}
                </div>
                );
            })
            )}
        </div>

        <DeleteConfirmationDialog
            open={deleteDialog.open}
            onOpenChange={(open) => setDeleteDialog({ open, id: null })}
            onConfirm={handleDelete}
            title="Delete activity?"
            description="This action cannot be undone."
        />
        </div>
    );
}