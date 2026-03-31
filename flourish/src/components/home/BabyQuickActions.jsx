// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { createBabyActivity } from '@/api/babyActivityApi';
import { createBabyMood } from '@/api/babyMoodApi';
import { createBabyProfile, listBabyProfiles } from '@/api/babyProfileApi';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';
import { getUserId as getStoredUserId } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Baby, Milk, Moon, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const napStorageKey = (uid) => `flourish_home_nap_in_progress_${uid}`;
/** Fallback when userId is not resolved yet (e.g. right after load) — migrated once userId exists */
const NAP_ANON_STORAGE_KEY = 'flourish_home_nap_in_progress';
const NAP_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function parseNapProgress(raw) {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        const startTime = parsed?.startTime;
        if (!startTime || typeof startTime !== 'string') return null;
        const started = new Date(startTime);
        if (Number.isNaN(started.getTime())) return null;
        if (Date.now() - started.getTime() > NAP_MAX_AGE_MS) return null;
        const storedUserId = parsed?.userId != null ? String(parsed.userId).trim() : null;
        return { startTime, storedUserId: storedUserId || null };
    } catch {
        return null;
    }
}

/** Returns startTime if payload belongs to currentUserId (or user unknown in payload). */
function napStartForCurrentUser(parsed, currentUserId) {
    if (!parsed) return null;
    if (parsed.storedUserId && currentUserId && parsed.storedUserId !== currentUserId) {
        return null;
    }
    return parsed.startTime;
}

function clearAllNapProgressKeys(uid) {
    try {
        localStorage.removeItem(NAP_ANON_STORAGE_KEY);
        const u = uid || (getStoredUserId() ? String(getStoredUserId()).trim() : null);
        if (u) localStorage.removeItem(napStorageKey(u));
    } catch {
        /* ignore */
    }
}

const feedingStorageKey = (uid) => `flourish_home_feeding_in_progress_${uid}`;
const FEEDING_ANON_STORAGE_KEY = 'flourish_home_feeding_in_progress';

function parseFeedingProgress(raw) {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        const startTime = parsed?.startTime;
        if (!startTime || typeof startTime !== 'string') return null;
        const started = new Date(startTime);
        if (Number.isNaN(started.getTime())) return null;
        if (Date.now() - started.getTime() > NAP_MAX_AGE_MS) return null;
        const storedUserId = parsed?.userId != null ? String(parsed.userId).trim() : null;
        return { startTime, storedUserId: storedUserId || null };
    } catch {
        return null;
    }
}

function feedingStartForCurrentUser(parsed, currentUserId) {
    if (!parsed) return null;
    if (parsed.storedUserId && currentUserId && parsed.storedUserId !== currentUserId) {
        return null;
    }
    return parsed.startTime;
}

function clearAllFeedingProgressKeys(uid) {
    try {
        localStorage.removeItem(FEEDING_ANON_STORAGE_KEY);
        const u = uid || (getStoredUserId() ? String(getStoredUserId()).trim() : null);
        if (u) localStorage.removeItem(feedingStorageKey(u));
    } catch {
        /* ignore */
    }
}

/** Read-only time: always show start → end range */
function getRecordedSessionLines(isoStart, isoEnd) {
    if (!isoStart || !isoEnd) return null;
    const start = new Date(isoStart);
    const end = new Date(isoEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const sameCalendarDay = format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd');
    if (sameCalendarDay) {
        return [
            `Recorded · ${format(start, 'MMM d')} · ${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`,
        ];
    }
    return [
        `Recorded · ${format(start, 'MMM d, h:mm a')} – ${format(end, 'MMM d, h:mm a')}`,
    ];
}

function RecordedTimeHint({ isoStart, isoEnd }) {
    const lines = getRecordedSessionLines(isoStart, isoEnd);
    if (!lines?.length) return null;
    return (
        <div
            className="flex items-start gap-2.5"
            role="status"
            aria-label={lines.join('. ')}
        >
            <Clock className="w-3.5 h-3.5 text-[#B5A8C4] shrink-0 mt-0.5" strokeWidth={2} aria-hidden />
            <div className="min-w-0 space-y-0.5">
                {lines.map((line, i) => (
                    <p
                        key={i}
                        className={
                            i === 0
                                ? 'text-[13px] leading-snug text-[#6B6080]'
                                : 'text-xs leading-snug text-[#9D93AE]'
                        }
                    >
                        {line}
                    </p>
                ))}
            </div>
        </div>
    );
}

const BABY_MOOD_CHIPS = ['Calm', 'Happy', 'Fussy', 'Sleepy', 'Playful', 'Cranky', 'Content', 'Alert'];
const BABY_MOOD_EMOJIS = ['😭', '😣', '😐', '🙂', '😄'];

export default function BabyQuickActions() {
    const queryClient = useQueryClient();
    const [isBabyMoodDragging, setIsBabyMoodDragging] = useState(false);
    const ensureBabyAttemptedRef = useRef(false);

    const { userId } = useCurrentUserId();

    useEffect(() => {
        ensureBabyAttemptedRef.current = false;
    }, [userId]);

    const { data: babyProfiles = [], isSuccess: babyListReady } = useQuery({
        queryKey: ['babyProfiles', userId],
        queryFn: () => listBabyProfiles({ filter: { user_id: userId } }),
        enabled: Boolean(userId),
    });

    const { mutate: ensureDefaultBaby } = useMutation({
        mutationFn: () =>
            createBabyProfile({
                baby_name: 'Baby',
                baby_date_of_birth: '2024-06-01T00:00:00.000Z',
                user_id: userId,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['babyProfiles'] });
        },
        onError: () => {
            ensureBabyAttemptedRef.current = false;
        },
    });

    useEffect(() => {
        if (
            !userId ||
            !babyListReady ||
            babyProfiles.length > 0 ||
            ensureBabyAttemptedRef.current
        ) {
            return;
        }
        ensureBabyAttemptedRef.current = true;
        ensureDefaultBaby();
    }, [userId, babyListReady, babyProfiles.length, ensureDefaultBaby]);

    const ensureBabyId = async () => {
        if (!userId) return '';
        const fromList = babyProfiles[0]?.baby_id ?? babyProfiles[0]?.babyId;
        if (fromList) return String(fromList);
        const created = await createBabyProfile({
            baby_name: 'Baby',
            baby_date_of_birth: '2024-06-01T00:00:00.000Z',
            user_id: userId,
        });
        const bid = created?.baby_id ?? created?.babyId;
        await queryClient.invalidateQueries({ queryKey: ['babyProfiles'] });
        return bid ? String(bid) : '';
    };
    const [feedingTimer, setFeedingTimer] = useState(null);
    const [napTimer, setNapTimer] = useState(null);
    const [showMoodEntry, setShowMoodEntry] = useState(false);
    const [showFeedingForm, setShowFeedingForm] = useState(false);
    const [showNapForm, setShowNapForm] = useState(false);

    // Set the default data
    const [feedingData, setFeedingData] = useState({
        startTime: null,
        endTime: null,
        notes: '',
        type: 'breastfeed',
        breast_side: 'left',
        amount_oz: '',
        food_type: '',
        food_amount: '',
    });
    const [napData, setNapData] = useState({ startTime: null, endTime: null, notes: '' });
    const [moodData, setMoodData] = useState({ mood_value: 50, tags: [] });
    const [moodSaveError, setMoodSaveError] = useState('');

    // Restore in-progress nap after navigation/refresh (per-user key, or shared key until userId exists)
    useEffect(() => {
        const uid = userId || (getStoredUserId() ? String(getStoredUserId()).trim() : null);
        const userRaw = uid ? localStorage.getItem(napStorageKey(uid)) : null;
        const userParsed = parseNapProgress(userRaw);
        const fromUser = userParsed ? napStartForCurrentUser(userParsed, uid) : null;

        const anonParsed = parseNapProgress(localStorage.getItem(NAP_ANON_STORAGE_KEY));
        const fromAnon = anonParsed ? napStartForCurrentUser(anonParsed, uid) : null;

        const startTime = fromUser || fromAnon;
        if (!startTime) {
            try {
                if (uid) localStorage.removeItem(napStorageKey(uid));
                localStorage.removeItem(NAP_ANON_STORAGE_KEY);
            } catch {
                /* ignore */
            }
            return;
        }
        setNapTimer(startTime);
        setNapData((prev) => ({ ...prev, startTime }));
        if (uid && fromAnon && !fromUser) {
            try {
                localStorage.setItem(
                    napStorageKey(uid),
                    JSON.stringify({ startTime, userId: uid }),
                );
                localStorage.removeItem(NAP_ANON_STORAGE_KEY);
            } catch {
                /* ignore */
            }
        }
    }, [userId]);

    // Keep localStorage in sync whenever an in-progress nap exists (covers userId resolving after start)
    useEffect(() => {
        if (!napTimer) return;
        const uid = userId || (getStoredUserId() ? String(getStoredUserId()).trim() : null);
        const payload = JSON.stringify({
            startTime: napTimer,
            ...(uid ? { userId: uid } : {}),
        });
        try {
            localStorage.setItem(NAP_ANON_STORAGE_KEY, payload);
            if (uid) {
                localStorage.setItem(napStorageKey(uid), payload);
            }
        } catch {
            /* ignore quota */
        }
    }, [napTimer, userId]);

    // Restore in-progress feeding (same pattern as nap)
    useEffect(() => {
        const uid = userId || (getStoredUserId() ? String(getStoredUserId()).trim() : null);
        const userRaw = uid ? localStorage.getItem(feedingStorageKey(uid)) : null;
        const userParsed = parseFeedingProgress(userRaw);
        const fromUser = userParsed ? feedingStartForCurrentUser(userParsed, uid) : null;
        const anonParsed = parseFeedingProgress(localStorage.getItem(FEEDING_ANON_STORAGE_KEY));
        const fromAnon = anonParsed ? feedingStartForCurrentUser(anonParsed, uid) : null;
        const startTime = fromUser || fromAnon;
        if (!startTime) {
            try {
                if (uid) localStorage.removeItem(feedingStorageKey(uid));
                localStorage.removeItem(FEEDING_ANON_STORAGE_KEY);
            } catch {
                /* ignore */
            }
            return;
        }
        setFeedingTimer(startTime);
        setFeedingData((prev) => ({ ...prev, startTime }));
        if (uid && fromAnon && !fromUser) {
            try {
                localStorage.setItem(
                    feedingStorageKey(uid),
                    JSON.stringify({ startTime, userId: uid }),
                );
                localStorage.removeItem(FEEDING_ANON_STORAGE_KEY);
            } catch {
                /* ignore */
            }
        }
    }, [userId]);

    useEffect(() => {
        if (!feedingTimer) return;
        const uid = userId || (getStoredUserId() ? String(getStoredUserId()).trim() : null);
        const payload = JSON.stringify({
            startTime: feedingTimer,
            ...(uid ? { userId: uid } : {}),
        });
        try {
            localStorage.setItem(FEEDING_ANON_STORAGE_KEY, payload);
            if (uid) {
                localStorage.setItem(feedingStorageKey(uid), payload);
            }
        } catch {
            /* ignore quota */
        }
    }, [feedingTimer, userId]);

    const createActivityMutation = useMutation({
        mutationFn: (data) => createBabyActivity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['babyActivities'] });
        },
    });

    const createBabyMoodMutation = useMutation({
        mutationFn: (data) => createBabyMood(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['babyMoods'] });
            setShowMoodEntry(false);
            setMoodData({ mood_value: 50, tags: [] });
        },
    });

    // FEEDING FUNCTIONS
        const startFeeding = () => {
            setFeedingTimer(new Date().toISOString());
            setFeedingData((prev) => ({ ...prev, startTime: new Date().toISOString() }));
        };
        const endFeeding = () => {
            const endTime = new Date().toISOString();
            setFeedingData((prev) => ({ ...prev, endTime }));
            setShowFeedingForm(true);
            setFeedingTimer(null);
            clearAllFeedingProgressKeys(userId);
        };
        const resetFeedingState = () => ({
            startTime: null,
            endTime: null,
            notes: '',
            type: 'breastfeed',
            breast_side: 'left',
            amount_oz: '',
            food_type: '',
            food_amount: '',
        });
        const saveFeeding = async () => {
            try {
            const bid = await ensureBabyId();
            if (!bid) return;
            const duration = Math.round((new Date(feedingData.endTime) - new Date(feedingData.startTime)) / 60000);
            const payload = {
            baby_id: bid,
            user_id: userId,
            type: feedingData.type,
            timestamp: feedingData.startTime,
            duration_minutes: duration,
            notes: feedingData.notes || undefined,
            };
            if (feedingData.type === 'breastfeed') {
                payload.breast_side = feedingData.breast_side;
            } else if (feedingData.type === 'bottle') {
                const oz = feedingData.amount_oz ? parseFloat(feedingData.amount_oz) : NaN;
                if (!Number.isNaN(oz)) payload.amount_oz = oz;
            } else if (feedingData.type === 'other') {
                payload.food_type = feedingData.food_type || undefined;
                payload.food_amount = feedingData.food_amount || undefined;
            }
            createActivityMutation.mutate(payload);
            setShowFeedingForm(false);
            setFeedingData(resetFeedingState());
            clearAllFeedingProgressKeys(userId);
            } catch (e) {
            console.error('Save feeding failed', e);
            }
        };
        const discardFeeding = () => {
            setShowFeedingForm(false);
            setFeedingData(resetFeedingState());
            clearAllFeedingProgressKeys(userId);
        };

    // NAP FUNCTIONS
        const startNap = () => {
            const startTime = new Date().toISOString();
            setNapTimer(startTime);
            setNapData((prev) => ({ ...prev, startTime }));
        };
        const endNap = () => {
            const endTime = new Date().toISOString();
            setNapData((prev) => ({ ...prev, endTime }));
            setShowNapForm(true);
            setNapTimer(null);
            clearAllNapProgressKeys(userId);
        };
        const clearNapStorage = () => {
            clearAllNapProgressKeys(userId);
        };
        const saveNap = async () => {
            try {
            const bid = await ensureBabyId();
            if (!bid) return;
            const duration = Math.round((new Date(napData.endTime) - new Date(napData.startTime)) / 60000);
            createActivityMutation.mutate({
            baby_id: bid,
            user_id: userId,
            type: 'nap',
            timestamp: napData.startTime,
            duration_minutes: duration,
            notes: napData.notes
            });
            setShowNapForm(false);
            setNapData({ startTime: null, endTime: null, notes: '' });
            clearNapStorage();
            } catch (e) {
            console.error('Save nap failed', e);
            }
        };
        const discardNap = () => {
            setShowNapForm(false);
            setNapData({ startTime: null, endTime: null, notes: '' });
            clearNapStorage();
        };

    // MOOD FUNCTIONS
        const saveMood = async () => {
            setMoodSaveError('');
            try {
                const bid = await ensureBabyId();
                if (!bid) {
                    setMoodSaveError(
                        'No baby profile found and we could not create one. Check the API is running.',
                    );
                    return;
                }
                await createBabyMoodMutation.mutateAsync({
                    baby_id: bid,
                    user_id: userId,
                    mood_value: moodData.mood_value,
                    timestamp: new Date().toISOString(),
                    tags: Array.isArray(moodData.tags) ? [...moodData.tags] : [],
                });
            } catch (e) {
                const msg =
                    e?.message ||
                    'Could not save baby mood. Check the network tab for the API response.';
                setMoodSaveError(msg);
                console.error('Save baby mood failed', e);
            }
        };
        const toggleMoodTag = (tag) => {
            setMoodData(prev => ({
                ...prev,
                tags: prev.tags.includes(tag)
                    ? prev.tags.filter(t => t !== tag)
                    : [...prev.tags, tag]
            }));
        };

    return (
        <div className="rounded-3xl border border-[#E8E4F3]/70 bg-white p-6 shadow-sm ring-1 ring-[#F5F0FA]/90">
            {/* Title */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8E4F3]/60">
                    <Baby className="h-4 w-4 text-[#8B7A9F]" strokeWidth={2} aria-hidden />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5A4B70]">
                    Quick Actions
                </p>
            </div>

            {/* Basic Three buttons  */}
            <div className="grid grid-cols-3 gap-3">
                {/* Feeding Button */}
                <button
                    type="button"
                    onClick={feedingTimer ? endFeeding : startFeeding}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 text-[#4A4458] transition-all ${
                        feedingTimer
                            ? 'bg-gradient-to-br from-[#F5E6EA] to-[#EDD9E8] shadow-md shadow-[#8B7A9F]/10 ring-1 ring-white/90'
                            : 'bg-gradient-to-br from-[#F5E6EA] to-[#EDD9E8] hover:shadow-md hover:shadow-[#8B7A9F]/[0.06]'
                    }`}
                >
                    <Milk className="h-6 w-6 text-[#6B5D82]" strokeWidth={1.75} aria-hidden />
                    <span className="text-center text-xs font-medium leading-tight">
                        {feedingTimer ? 'End Feeding' : 'Start Feeding'}
                    </span>
                    {feedingTimer ? (
                        <Clock className="h-3 w-3 animate-pulse text-[#8B7A9F]" aria-hidden />
                    ) : null}
                </button>
                {/* Nap Button */}
                <button
                    type="button"
                    onClick={napTimer ? endNap : startNap}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 text-[#4A4458] transition-all ${
                        napTimer
                            ? 'bg-gradient-to-br from-[#EDD9E8] to-[#E8E4F3] shadow-md shadow-[#8B7A9F]/10 ring-1 ring-white/90'
                            : 'bg-gradient-to-br from-[#EDD9E8] to-[#E8E4F3] hover:shadow-md hover:shadow-[#8B7A9F]/[0.06]'
                    }`}
                >
                    <Moon className="h-6 w-6 text-[#6B5D82]" strokeWidth={1.75} aria-hidden />
                    <span className="text-center text-xs font-medium leading-tight">
                        {napTimer ? 'End Nap' : 'Start Nap'}
                    </span>
                    {napTimer ? (
                        <Clock className="h-3 w-3 animate-pulse text-[#8B7A9F]" aria-hidden />
                    ) : null}
                </button>
                {/* Mood Button */}
                <button
                    type="button"
                    onClick={() => {
                        setMoodSaveError('');
                        setShowMoodEntry(true);
                    }}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#E8E4F3] to-[#D9EEF2] p-4 text-[#4A4458] transition-all hover:shadow-md hover:shadow-[#8B7A9F]/[0.06]"
                >
                    <Baby className="h-6 w-6 text-[#6B5D82]" strokeWidth={1.75} aria-hidden />
                    <span className="text-center text-xs font-medium leading-tight">Baby Mood</span>
                </button>
            </div>

            {/* Expandable form shown after ending a feeding session */}
            {showFeedingForm && (
                <div className="mt-5 pt-5 border-t border-[#D4C8DC] space-y-5">
                    <div className="space-y-2.5">
                        <h3 className="text-base font-semibold text-[#4A4458] tracking-tight">Log Feeding</h3>
                        <RecordedTimeHint
                            isoStart={feedingData.startTime}
                            isoEnd={feedingData.endTime}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="feeding-type-select" className="text-xs font-medium text-[#7D7589]">
                                Feeding type
                            </label>
                            <Select
                                value={feedingData.type}
                                onValueChange={(value) => setFeedingData({ ...feedingData, type: value })}
                            >
                                <SelectTrigger
                                    id="feeding-type-select"
                                    className="h-11 bg-white border-[#E8E4F3] text-sm text-[#4A4458] shadow-none focus:ring-2 focus:ring-[#C9B8D8]/50"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="breastfeed">Breastfeeding</SelectItem>
                                    <SelectItem value="bottle">Bottle</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {feedingData.type === 'breastfeed' && (
                            <div className="space-y-1.5">
                                <label htmlFor="feeding-side-select" className="text-xs font-medium text-[#7D7589]">
                                    Side
                                </label>
                                <Select
                                    value={feedingData.breast_side}
                                    onValueChange={(value) =>
                                        setFeedingData({ ...feedingData, breast_side: value })
                                    }
                                >
                                    <SelectTrigger
                                        id="feeding-side-select"
                                        className="h-11 bg-white border-[#E8E4F3] text-sm text-[#4A4458] shadow-none focus:ring-2 focus:ring-[#C9B8D8]/50"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="left">Left</SelectItem>
                                        <SelectItem value="right">Right</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {feedingData.type === 'bottle' && (
                            <div className="space-y-1.5">
                                <label htmlFor="feeding-amount-oz" className="text-xs font-medium text-[#7D7589]">
                                    Amount (oz)
                                </label>
                                <Input
                                    id="feeding-amount-oz"
                                    type="number"
                                    inputMode="decimal"
                                    step="0.5"
                                    min="0"
                                    placeholder="e.g. 4"
                                    value={feedingData.amount_oz}
                                    onChange={(e) =>
                                        setFeedingData({ ...feedingData, amount_oz: e.target.value })
                                    }
                                    className="h-11 bg-white border-[#E8E4F3] text-sm placeholder:text-[#B8AEC4] focus-visible:ring-2 focus-visible:ring-[#C9B8D8]/50"
                                />
                            </div>
                        )}
                        {feedingData.type === 'other' && (
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label htmlFor="feeding-food-type" className="text-xs font-medium text-[#7D7589]">
                                        Type (e.g. solids, medicine)
                                    </label>
                                    <Input
                                        id="feeding-food-type"
                                        placeholder="What did baby have?"
                                        value={feedingData.food_type}
                                        onChange={(e) =>
                                            setFeedingData({ ...feedingData, food_type: e.target.value })
                                        }
                                        className="h-11 bg-white border-[#E8E4F3] text-sm placeholder:text-[#B8AEC4] focus-visible:ring-2 focus-visible:ring-[#C9B8D8]/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="feeding-food-amt" className="text-xs font-medium text-[#7D7589]">
                                        Amount / details (optional)
                                    </label>
                                    <Input
                                        id="feeding-food-amt"
                                        placeholder="e.g. 2 tbsp, 5 ml"
                                        value={feedingData.food_amount}
                                        onChange={(e) =>
                                            setFeedingData({ ...feedingData, food_amount: e.target.value })
                                        }
                                        className="h-11 bg-white border-[#E8E4F3] text-sm placeholder:text-[#B8AEC4] focus-visible:ring-2 focus-visible:ring-[#C9B8D8]/50"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="feeding-notes" className="text-xs font-medium text-[#7D7589]">
                            Notes <span className="font-normal text-[#B8AEC4]">(optional)</span>
                        </label>
                        <Textarea
                            id="feeding-notes"
                            name="feeding-notes"
                            rows={2}
                            placeholder="Anything else to remember…"
                            value={feedingData.notes}
                            onChange={(e) => setFeedingData({ ...feedingData, notes: e.target.value })}
                            className="min-h-[4.25rem] max-h-28 resize-y bg-white border-[#E8E4F3] text-sm placeholder:text-[#B8AEC4] focus-visible:ring-2 focus-visible:ring-[#C9B8D8]/50"
                        />
                    </div>

                    <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end sm:gap-3 pt-0.5">
                        <Button
                            type="button"
                            onClick={discardFeeding}
                            variant="outline"
                            className="min-h-11 rounded-2xl sm:min-w-[7.5rem] border-[#D8CFE8] bg-white/80 text-[#5A4B70] hover:bg-[#F5F0FA] hover:text-[#4A4458] sm:flex-initial"
                        >
                            Discard
                        </Button>
                        <Button
                            type="button"
                            onClick={saveFeeding}
                            className="min-h-11 rounded-2xl sm:min-w-[8.5rem] bg-[#8B7A9F] font-semibold text-white shadow-sm hover:bg-[#7D6D90] sm:flex-initial"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            )}

            {/* Expandable form shown after ending a nap */}
            {showNapForm && (
                <div className="mt-5 pt-5 border-t border-[#D4C8DC] space-y-5">
                    <div className="space-y-2.5">
                        <h3 className="text-base font-semibold text-[#4A4458] tracking-tight">Log Nap</h3>
                        <RecordedTimeHint isoStart={napData.startTime} isoEnd={napData.endTime} />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="nap-notes" className="text-xs font-medium text-[#7D7589]">
                            Notes <span className="font-normal text-[#B8AEC4]">(optional)</span>
                        </label>
                        <Textarea
                            id="nap-notes"
                            name="nap-notes"
                            rows={2}
                            placeholder="How did they sleep?"
                            value={napData.notes}
                            onChange={(e) => setNapData({ ...napData, notes: e.target.value })}
                            className="min-h-[4.25rem] max-h-28 resize-y bg-white border-[#E8E4F3] text-sm placeholder:text-[#B8AEC4] focus-visible:ring-2 focus-visible:ring-[#C9B8D8]/50"
                        />
                    </div>

                    <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end sm:gap-3 pt-0.5">
                        <Button
                            type="button"
                            onClick={discardNap}
                            variant="outline"
                            className="min-h-11 rounded-2xl sm:min-w-[7.5rem] border-[#D8CFE8] bg-white/80 text-[#5A4B70] hover:bg-[#F5F0FA] hover:text-[#4A4458] sm:flex-initial"
                        >
                            Discard
                        </Button>
                        <Button
                            type="button"
                            onClick={saveNap}
                            className="min-h-11 rounded-2xl sm:min-w-[8.5rem] bg-[#8B7A9F] font-semibold text-white shadow-sm hover:bg-[#7D6D90] sm:flex-initial"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            )}

            {/* Mood entry: slider (0–100) plus optional tags */}
            {showMoodEntry && (
                <div className="mt-5 pt-5 border-t border-[#D4C8DC] space-y-5">
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-[#4A4458] tracking-tight">
                            Baby mood
                        </h3>
                        <p className="text-xs text-[#9D93AE] leading-relaxed">
                            Drag to capture how they seem overall, then add tags if you like.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="baby-mood-slider" className="text-xs font-medium text-[#7D7589]">
                                Overall mood
                            </label>
                            {/* Slider matches MoodCheckIn.jsx */}
                            <div className="relative mb-6">
                                <div className="h-8 rounded-full bg-gradient-to-r from-[#D9EEF2] via-[#E8E4F3] to-[#EDD9E8] overflow-hidden" />
                                <input
                                    id="baby-mood-slider"
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={moodData.mood_value}
                                    onChange={(e) =>
                                        setMoodData({
                                            ...moodData,
                                            mood_value: parseInt(e.target.value, 10),
                                        })
                                    }
                                    onMouseDown={() => setIsBabyMoodDragging(true)}
                                    onMouseUp={() => setIsBabyMoodDragging(false)}
                                    onTouchStart={() => setIsBabyMoodDragging(true)}
                                    onTouchEnd={() => setIsBabyMoodDragging(false)}
                                    className="absolute inset-0 h-8 w-full cursor-pointer opacity-0"
                                    aria-valuetext={`${moodData.mood_value} out of 100`}
                                />
                                <motion.div
                                    className="pointer-events-none absolute top-0 z-10 flex h-12 w-12 -mt-2 items-center justify-center rounded-full border-2 border-[#5A4B70] bg-white text-xl shadow-lg"
                                    style={{
                                        left: `calc(${moodData.mood_value}% - 24px)`,
                                    }}
                                    animate={{ scale: isBabyMoodDragging ? 1.15 : 1 }}
                                    transition={{ duration: 0.2 }}
                                    aria-hidden
                                >
                                    {
                                        BABY_MOOD_EMOJIS[
                                            Math.min(Math.floor(moodData.mood_value / 25), 4)
                                        ]
                                    }
                                </motion.div>
                            </div>
                            <div className="flex justify-between text-xs text-[#5A4B70]">
                                <span>Upset</span>
                                <span>Okay</span>
                                <span>Happy</span>
                            </div>
                            <p className="text-center text-xs text-[#B8AEC4] tabular-nums">
                                {moodData.mood_value} / 100
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-medium text-[#7D7589]">
                                Tags <span className="font-normal text-[#B8AEC4]">(optional)</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {BABY_MOOD_CHIPS.map((chip) => {
                                    const on = moodData.tags.includes(chip);
                                    return (
                                        <motion.button
                                            key={chip}
                                            type="button"
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => toggleMoodTag(chip)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                on
                                                    ? 'bg-[#A8C5D5] text-[#4A4458]'
                                                    : 'bg-[#D9EEF2] text-[#4A4458]'
                                            }`}
                                        >
                                            {chip}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {moodSaveError ? (
                        <p
                            className="text-sm text-[#8B4A4A] bg-[#FDF5F5] border border-[#F0D6D6] rounded-xl px-3 py-2.5 leading-snug"
                            role="alert"
                        >
                            {moodSaveError}
                        </p>
                    ) : null}

                    <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end sm:gap-3 pt-0.5">
                        <Button
                            type="button"
                            onClick={() => {
                                setMoodSaveError('');
                                setShowMoodEntry(false);
                            }}
                            variant="outline"
                            className="min-h-11 rounded-2xl sm:min-w-[7.5rem] border-[#D8CFE8] bg-white/80 text-[#5A4B70] hover:bg-[#F5F0FA] hover:text-[#4A4458] sm:flex-initial"
                            disabled={createBabyMoodMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={saveMood}
                            className="min-h-11 rounded-2xl sm:min-w-[8.5rem] bg-[#8B7A9F] font-semibold text-white shadow-sm hover:bg-[#7D6D90] sm:flex-initial"
                            disabled={createBabyMoodMutation.isPending}
                        >
                            {createBabyMoodMutation.isPending ? 'Saving…' : 'Save'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}