import React, { useState, useMemo, useCallback } from 'react';
import {
    format,
    startOfWeek,
    addDays,
    isToday,
    isSameDay,
    addMinutes,
    differenceInMinutes,
    differenceInCalendarDays,
    startOfDay,
    endOfDay,
    isBefore,
    isAfter,
    isSameMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Milk, Baby, Moon, MoreHorizontal, Trash2 } from 'lucide-react';
import { deleteBabyActivity } from '@/api/babyActivityApi';
import { useQueryClient } from '@tanstack/react-query';
import {
    babyActivityId,
    babyActivityTimestamp,
    babyActivityType,
    parseBabyActivityTimestampToDate,
} from '@/lib/babyEntityFields';
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

const DEFAULT_FEEDING_GAP_MIN = 180;
const DEFAULT_NAP_GAP_MIN = 120;
const ESTIMATE_MAX_DAYS_AHEAD = 14;
/** Estimates must be strictly after "now" by this buffer (avoids duplicate wall-clock with just-logged events). */
const ESTIMATE_FUTURE_BUFFER_MS = 90 * 1000;
/** Skip estimated slot if within this window of a real logged event (same category). */
const DEDUPE_NEAR_ACTUAL_MS = 2.5 * 60 * 1000;

function weekDaysFromStart(weekStart) {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

function weekRangeMonthLabel(weekStart) {
    const weekEnd = addDays(weekStart, 6);
    if (isSameMonth(weekStart, weekEnd)) {
        return format(weekStart, 'MMMM yyyy');
    }
    return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
}

function averageGapMinutes(sortedNewestFirst) {
    const list = sortedNewestFirst;
    if (list.length < 2) return null;
    let total = 0;
    let counted = 0;
    for (let i = 0; i < list.length - 1; i++) {
        const a = parseBabyActivityTimestampToDate(babyActivityTimestamp(list[i]));
        const b = parseBabyActivityTimestampToDate(babyActivityTimestamp(list[i + 1]));
        if (!a || !b) continue;
        total += differenceInMinutes(a, b);
        counted += 1;
    }
    if (counted < 1) return null;
    const avg = Math.round(total / counted);
    return avg > 0 ? avg : null;
}

function isNearAnyActual(tMs, actuals, typeMatcher) {
    return actuals.some((a) => {
        if (!typeMatcher(a)) return false;
        const raw = babyActivityTimestamp(a);
        if (!raw) return false;
        const aMs = new Date(raw).getTime();
        if (Number.isNaN(aMs)) return false;
        return Math.abs(tMs - aMs) < DEDUPE_NEAR_ACTUAL_MS;
    });
}

/**
 * Walk forward from last event by interval; only emit slots strictly in the future (local)
 * and not on top of an existing logged row.
 */
function collectDayEstimates({
    lastEventIso,
    intervalMin,
    selectedDate,
    now,
    type,
    idPrefix,
    actualsOnSelectedDay,
    typeMatcher,
}) {
    if (!lastEventIso || !intervalMin) return [];
    const sel0 = startOfDay(selectedDate);
    const selEnd = endOfDay(selectedDate);
    const today0 = startOfDay(now);
    if (isBefore(sel0, today0)) return [];
    if (differenceInCalendarDays(sel0, today0) > ESTIMATE_MAX_DAYS_AHEAD) return [];

    const t0 = parseBabyActivityTimestampToDate(lastEventIso);
    if (!t0) return [];
    let t = t0;

    const nowMs = now.getTime();
    const minFutureMs = nowMs + ESTIMATE_FUTURE_BUFFER_MS;

    let guard = 0;
    while (t.getTime() < minFutureMs && guard < 120) {
        t = addMinutes(t, intervalMin);
        guard++;
    }

    guard = 0;
    while (t.getTime() < sel0.getTime() && guard < 120) {
        t = addMinutes(t, intervalMin);
        guard++;
    }

    const out = [];
    for (let i = 0; i < 48 && out.length < 16; i++) {
        if (isAfter(t, selEnd)) break;
        const tMs = t.getTime();
        if (
            tMs >= minFutureMs &&
            t >= sel0 &&
            t <= selEnd &&
            !isNearAnyActual(tMs, actualsOnSelectedDay, typeMatcher)
        ) {
            out.push({
                id: `${idPrefix}-${tMs}-${i}`,
                type,
                timestamp: t.toISOString(),
                isEstimate: true,
            });
        }
        t = addMinutes(t, intervalMin);
    }
    return out;
}

export default function HistorySection({ activities, onEditActivity }) {
    const queryClient = useQueryClient();
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [filter, setFilter] = useState('all');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

    const weekStrip = useMemo(() => weekDaysFromStart(weekStart), [weekStart]);
    const headerTitle = weekRangeMonthLabel(weekStart);

    const handlePrevWeek = () => {
        setWeekStart((s) => addDays(s, -7));
    };

    const handleNextWeek = () => {
        setWeekStart((s) => addDays(s, 7));
    };

    const handleDelete = async () => {
        try {
            if (deleteDialog.id) {
                await deleteBabyActivity(deleteDialog.id);
                queryClient.invalidateQueries({ queryKey: ['babyActivities'] });
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
        }
        setDeleteDialog({ open: false, id: null });
    };

    const getActivitiesForDate = (date) => {
        return activities.filter((a) => {
            const ts = babyActivityTimestamp(a);
            if (!ts) return false;
            return isSameDay(new Date(ts), date);
        });
    };

    const getActivityTypes = (date) => {
        const dayActivities = getActivitiesForDate(date);
        const types = new Set(dayActivities.map((a) => babyActivityType(a)));
        return Array.from(types).filter(Boolean);
    };

    const activitiesOnSelectedDay = useMemo(() => {
        return activities.filter((a) => {
            const raw = babyActivityTimestamp(a);
            if (!raw) return false;
            const d = parseBabyActivityTimestampToDate(raw);
            return d ? isSameDay(d, selectedDate) : false;
        });
    }, [activities, selectedDate]);

    const getFilteredTimeline = () => {
        if (filter === 'all') return activitiesOnSelectedDay;
        const filterConfig = filterOptions.find((f) => f.id === filter);
        if (filterConfig?.types) {
            return activitiesOnSelectedDay.filter((a) =>
                filterConfig.types.includes(babyActivityType(a)),
            );
        }
        return activitiesOnSelectedDay;
    };

    const feedingActivities = useMemo(
        () =>
            activities.filter((a) => ['breastfeed', 'bottle'].includes(babyActivityType(a))),
        [activities],
    );

    const napActivities = useMemo(
        () => activities.filter((a) => babyActivityType(a) === 'nap'),
        [activities],
    );

    const sortedFeedingsNewest = useMemo(
        () =>
            [...feedingActivities].sort((a, b) => {
                const tb = parseBabyActivityTimestampToDate(babyActivityTimestamp(b))?.getTime() ?? 0;
                const ta = parseBabyActivityTimestampToDate(babyActivityTimestamp(a))?.getTime() ?? 0;
                return tb - ta;
            }),
        [feedingActivities],
    );

    const sortedNapsNewest = useMemo(
        () =>
            [...napActivities].sort((a, b) => {
                const tb = parseBabyActivityTimestampToDate(babyActivityTimestamp(b))?.getTime() ?? 0;
                const ta = parseBabyActivityTimestampToDate(babyActivityTimestamp(a))?.getTime() ?? 0;
                return tb - ta;
            }),
        [napActivities],
    );

    const getFutureEstimates = useCallback(() => {
        const now = new Date();
        const estimates = [];

        const feedingGap =
            averageGapMinutes(sortedFeedingsNewest) ??
            (sortedFeedingsNewest.length === 1 ? DEFAULT_FEEDING_GAP_MIN : null);
        const napGap =
            averageGapMinutes(sortedNapsNewest) ??
            (sortedNapsNewest.length === 1 ? DEFAULT_NAP_GAP_MIN : null);

        const wantFeeding = filter === 'all' || filter === 'feeding';
        const wantNap = filter === 'all' || filter === 'nap';

        const feedingMatcher = (a) => ['breastfeed', 'bottle'].includes(babyActivityType(a));
        const napMatcher = (a) => babyActivityType(a) === 'nap';

        if (wantFeeding && sortedFeedingsNewest.length >= 1 && feedingGap) {
            const last = sortedFeedingsNewest[0];
            const lastTs = babyActivityTimestamp(last);
            const lastType = babyActivityType(last);
            const estType = lastType === 'breastfeed' ? 'breastfeed' : 'bottle';
            estimates.push(
                ...collectDayEstimates({
                    lastEventIso: lastTs,
                    intervalMin: feedingGap,
                    selectedDate,
                    now,
                    type: estType,
                    idPrefix: 'est-feed',
                    actualsOnSelectedDay: activitiesOnSelectedDay,
                    typeMatcher: feedingMatcher,
                }),
            );
        }

        if (wantNap && sortedNapsNewest.length >= 1 && napGap) {
            const lastTs = babyActivityTimestamp(sortedNapsNewest[0]);
            estimates.push(
                ...collectDayEstimates({
                    lastEventIso: lastTs,
                    intervalMin: napGap,
                    selectedDate,
                    now,
                    type: 'nap',
                    idPrefix: 'est-nap',
                    actualsOnSelectedDay: activitiesOnSelectedDay,
                    typeMatcher: napMatcher,
                }),
            );
        }

        return estimates;
    }, [
        filter,
        selectedDate,
        sortedFeedingsNewest,
        sortedNapsNewest,
        activitiesOnSelectedDay,
    ]);

    const actualTimeline = getFilteredTimeline().sort((a, b) => {
        const ta = parseBabyActivityTimestampToDate(babyActivityTimestamp(a))?.getTime() ?? 0;
        const tb = parseBabyActivityTimestampToDate(babyActivityTimestamp(b))?.getTime() ?? 0;
        return ta - tb;
    });
    const futureEstimates = getFutureEstimates();
    const timeline = [...actualTimeline, ...futureEstimates].sort((a, b) => {
        const ta = parseBabyActivityTimestampToDate(a.timestamp ?? babyActivityTimestamp(a))?.getTime() ?? 0;
        const tb = parseBabyActivityTimestampToDate(b.timestamp ?? babyActivityTimestamp(b))?.getTime() ?? 0;
        return ta - tb;
    });

    const formatActivityTime = (raw) => {
        const d = parseBabyActivityTimestampToDate(raw);
        if (!d) return '';
        return format(d, 'h:mm a');
    };

    return (
        <div className="rounded-3xl border border-[#E8E4F3]/70 bg-white p-6 shadow-sm ring-1 ring-[#F5F0FA]/90">
            <p className="text-xs font-medium text-[#5A4B70] uppercase tracking-wide">
                History
            </p>

            <div className="mb-4 text-center">
                <p className="truncate text-base text-lg font-semibold tracking-tight text-[#5A4B70]">
                    {headerTitle}
                </p>
            </div>

            {/* Week: chevron navigation */}
            <div className="mb-4 flex items-stretch gap-2">
                <button
                    type="button"
                    onClick={handlePrevWeek}
                    className="flex shrink-0 items-center justify-center rounded-xl px-2 py-1 text-[#8B7A9F] transition-colors hover:bg-[#F5EEF8]"
                    aria-label="Previous week"
                >
                    <ChevronLeft className="h-6 w-6" strokeWidth={2} />
                </button>
                <div className="grid min-w-0 flex-1 grid-cols-7 gap-1">
                    {weekStrip.map((day) => {
                        const types = getActivityTypes(day);
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentDay = isToday(day);
                        return (
                            <button
                                key={day.toISOString()}
                                type="button"
                                onClick={() => setSelectedDate(day)}
                                className={`flex flex-col items-center rounded-xl py-2 transition-all ${
                                    isSelected ? 'bg-[#7D6F99] text-white' : 'hover:bg-[#F5EEF8]'
                                }`}
                            >
                                <span
                                    className={`text-xs ${isSelected ? 'text-white' : 'text-[#5A4B70]'}`}
                                >
                                    {format(day, 'EEE')}
                                </span>
                                <span
                                    className={`mt-1 text-sm font-semibold ${
                                        isSelected
                                            ? 'text-white'
                                            : isCurrentDay
                                              ? 'text-[#8B7A9F]'
                                              : 'text-[#4A4458]'
                                    } ${isCurrentDay && !isSelected ? 'border-b-2 border-[#8B7A9F]' : ''}`}
                                >
                                    {format(day, 'd')}
                                </span>
                                <div className="mt-1 flex gap-1">
                                    {types.slice(0, 3).map((type, i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                isSelected
                                                    ? 'bg-white'
                                                    : colorMap[type]?.dot || 'bg-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <button
                    type="button"
                    onClick={handleNextWeek}
                    className="flex shrink-0 items-center justify-center rounded-xl px-2 py-1 text-[#8B7A9F] transition-colors hover:bg-[#F5EEF8]"
                    aria-label="Next week"
                >
                    <ChevronRight className="h-6 w-6" strokeWidth={2} />
                </button>
            </div>

            <div className="mb-4 flex gap-2 rounded-xl bg-[#F5EEF8] p-1">
                {filterOptions.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => setFilter(option.id)}
                        className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                            filter === option.id
                                ? 'bg-white text-[#4A4458] shadow-sm'
                                : 'text-[#5A4B70]'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="max-h-80 space-y-3 overflow-y-auto">
                {timeline.length === 0 ? (
                    <p className="py-8 text-center text-[#7D7589]">
                        No activities on {format(selectedDate, 'MMM d')}
                    </p>
                ) : (
                    timeline.map((activity) => {
                        const t = babyActivityType(activity) || activity.type;
                        const Icon = iconMap[t] || MoreHorizontal;
                        const colors = colorMap[t] || colorMap.other;
                        const isEstimate = activity.isEstimate;
                        const rowKey = isEstimate ? activity.id : babyActivityId(activity);
                        const ts = activity.timestamp ?? babyActivityTimestamp(activity);

                        return (
                            <div
                                key={rowKey}
                                className={`group flex w-full gap-2 ${isEstimate ? 'opacity-70' : ''}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => !isEstimate && onEditActivity && onEditActivity(activity)}
                                    disabled={isEstimate}
                                    className={`flex min-w-0 flex-1 gap-3 text-left -m-2 rounded-xl p-2 ${
                                        !isEstimate
                                            ? 'transition-colors hover:bg-[#F5EEF8]'
                                            : 'cursor-default'
                                    }`}
                                >
                                    <div
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${colors.bg}`}
                                    >
                                        <Icon className={`h-4 w-4 ${colors.text}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="min-w-0 flex-1 text-sm font-medium capitalize leading-snug text-[#5A4B70]">
                                                {isEstimate ? (
                                                    <span className="font-normal text-[#9D93AE]">
                                                        Est.{' '}
                                                    </span>
                                                ) : null}
                                                {t === 'breastfeed'
                                                    ? 'Breastfeeding'
                                                    : t === 'bottle'
                                                    ? 'Bottle'
                                                    : activity.custom_type || activity.CustomType || t}
                                            </p>
                                            <time
                                                dateTime={ts || undefined}
                                                className="shrink-0 text-xs font-medium tabular-nums leading-none text-[#5A4B70]"
                                            >
                                                {formatActivityTime(ts)}
                                            </time>
                                        </div>
                                        {!isEstimate && (
                                            <>
                                                <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-[#5A4B70]">
                                                    {activity.duration_minutes != null &&
                                                        activity.duration_minutes > 0 && (
                                                            <span className="rounded-full bg-[#E8E4F3]/50 px-2 py-0.5">
                                                                {activity.duration_minutes} min
                                                            </span>
                                                        )}
                                                    {activity.breast_side && (
                                                        <span className="rounded-full bg-[#EDD9E8]/50 px-2 py-0.5 capitalize">
                                                            {activity.breast_side}
                                                        </span>
                                                    )}
                                                    {activity.amount_oz != null && (
                                                        <span className="rounded-full bg-[#D9EEF2]/50 px-2 py-0.5">
                                                            {activity.amount_oz} oz
                                                        </span>
                                                    )}
                                                    {activity.food_type && (
                                                        <span className="rounded-full bg-[#F5E6EA]/50 px-2 py-0.5">
                                                            {activity.food_type}
                                                        </span>
                                                    )}
                                                </div>
                                                {activity.notes && (
                                                    <p className="mt-1.5 text-xs italic text-[#7D7589]">
                                                        &ldquo;{activity.notes}&rdquo;
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </button>
                                {isEstimate ? (
                                    <div
                                        className="pointer-events-none flex h-10 shrink-0 items-center justify-center self-center rounded-lg p-2 opacity-0"
                                        aria-hidden
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteDialog({ open: true, id: babyActivityId(activity) });
                                        }}
                                        className="flex h-10 shrink-0 items-center justify-center self-center rounded-lg p-2 opacity-0 transition-all hover:bg-[#F5E6EA] group-hover:opacity-100"
                                        aria-label="Delete activity"
                                    >
                                        <Trash2 className="h-4 w-4 text-[#8B4A4A]" />
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
