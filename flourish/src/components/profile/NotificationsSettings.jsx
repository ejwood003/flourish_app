import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Plus, X, Bell, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

function moodTimesFromProfile(p) {
    const t = p?.notifications_mood_times ?? p?.notificationsMoodTimes;
    return Array.isArray(t) && t.length > 0 ? [...t] : ['09:00'];
}

function boolFromProfile(p, snake, camel, defaultVal) {
    const v = p?.[snake] ?? p?.[camel];
    return v ?? defaultVal;
}

/** e.g. "09:00" → "9:00 AM" */
function formatMoodTimeDisplay(t) {
    if (t == null || t === '') return '';
    const s = String(t).trim();
    const parts = s.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1] ?? '0', 10);
    if (Number.isNaN(h)) return s;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const mm = Number.isNaN(m) ? '00' : String(m).padStart(2, '0');
    return `${h12}:${mm} ${period}`;
}

/**
 * @param {object} props
 * @param {object} props.profile — UserProfile from REST (snake_case or camelCase)
 * @param {function} props.onSavePatch — async (patch: Record<string, unknown>) => void
 * @param {boolean} props.isSaving
 */
export default function NotificationsSettings({ profile, onSavePatch, isSaving }) {
    const [open, setOpen] = useState(false);
    const [localTimes, setLocalTimes] = useState(() => moodTimesFromProfile(profile));
    const [moodEnabled, setMoodEnabled] = useState(() =>
        boolFromProfile(profile, 'notifications_mood_enabled', 'notificationsMoodEnabled', true),
    );
    const [feedingEnabled, setFeedingEnabled] = useState(() =>
        boolFromProfile(profile, 'notifications_feeding_enabled', 'notificationsFeedingEnabled', false),
    );
    const [napEnabled, setNapEnabled] = useState(() =>
        boolFromProfile(profile, 'notifications_nap_enabled', 'notificationsNapEnabled', false),
    );
    const [showAddPicker, setShowAddPicker] = useState(false);
    const [draftTime, setDraftTime] = useState('09:00');
    const moodTimesSectionRef = useRef(null);

    const profileKey = profile?.user_id ?? profile?.userId ?? profile?.id ?? '';

    const syncFromProfile = useCallback(() => {
        setLocalTimes(moodTimesFromProfile(profile));
        setMoodEnabled(boolFromProfile(profile, 'notifications_mood_enabled', 'notificationsMoodEnabled', true));
        setFeedingEnabled(
            boolFromProfile(profile, 'notifications_feeding_enabled', 'notificationsFeedingEnabled', false),
        );
        setNapEnabled(boolFromProfile(profile, 'notifications_nap_enabled', 'notificationsNapEnabled', false));
    }, [profile]);

    useEffect(() => {
        syncFromProfile();
    }, [profileKey, syncFromProfile]);

    useEffect(() => {
        if (!showAddPicker) return;
        const onDocMouseDown = (e) => {
            const el = moodTimesSectionRef.current;
            if (el && !el.contains(e.target)) {
                setShowAddPicker(false);
            }
        };
        document.addEventListener('mousedown', onDocMouseDown);
        return () => document.removeEventListener('mousedown', onDocMouseDown);
    }, [showAddPicker]);

    const handleToggleSave = async (updates) => {
        await onSavePatch(updates);
    };

    const handleMoodToggle = async (v) => {
        const prev = moodEnabled;
        setMoodEnabled(v);
        if (!v) setShowAddPicker(false);
        try {
            await handleToggleSave({ notifications_mood_enabled: v });
        } catch {
            setMoodEnabled(prev);
        }
    };

    const handleFeedingToggle = async (v) => {
        const prev = feedingEnabled;
        setFeedingEnabled(v);
        try {
            await handleToggleSave({ notifications_feeding_enabled: v });
        } catch {
            setFeedingEnabled(prev);
        }
    };

    const handleNapToggle = async (v) => {
        const prev = napEnabled;
        setNapEnabled(v);
        try {
            await handleToggleSave({ notifications_nap_enabled: v });
        } catch {
            setNapEnabled(prev);
        }
    };

    const handleChipDelete = async (index) => {
        if (localTimes.length <= 1) return;
        const prev = localTimes;
        const next = localTimes.filter((_, idx) => idx !== index);
        setLocalTimes(next);
        try {
            await onSavePatch({ notifications_mood_times: next });
        } catch {
            setLocalTimes(prev);
        }
    };

    const openAddPicker = () => {
        setDraftTime('09:00');
        setShowAddPicker(true);
    };

    const cancelAddPicker = () => {
        setShowAddPicker(false);
    };

    const confirmAddTime = async () => {
        const t = draftTime || '09:00';
        if (localTimes.includes(t)) {
            setShowAddPicker(false);
            return;
        }
        const prev = localTimes;
        const next = [...localTimes, t];
        setLocalTimes(next);
        try {
            await onSavePatch({ notifications_mood_times: next });
            setShowAddPicker(false);
        } catch {
            setLocalTimes(prev);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between p-5 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E8E4F3] flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-[#8B7A9F]" />
                    </div>
                    <div>
                        <p className="font-semibold text-[#4A4458]">Notifications</p>
                        <p className="text-xs text-[#7D7589] mt-0.5">Reminders and alerts</p>
                    </div>
                </div>
                {open ? (
                    <ChevronUp className="w-4 h-4 text-[#7D7589]" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-[#7D7589]" />
                )}
            </button>

            {open ? (
                <div className="border-t border-[#F5EEF8]">
                    <div className="px-5 py-4 border-b border-[#F5EEF8]">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-medium text-[#4A4458]">Daily Mood Check-in</p>
                                <p className="text-xs text-[#7D7589] mt-0.5">Remind me to log my mood</p>
                            </div>
                            <Switch
                                checked={moodEnabled}
                                onCheckedChange={handleMoodToggle}
                                className="data-[state=checked]:bg-[#8B7A9F]"
                            />
                        </div>

                        {moodEnabled ? (
                            <div ref={moodTimesSectionRef} className="relative">
                                <div className="flex flex-wrap gap-2">
                                    {localTimes.map((time, i) => (
                                        <span
                                            key={`mood-chip-${i}`}
                                            className="inline-flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full bg-[#E8E4F3] text-sm font-medium text-[#4A4458]"
                                        >
                                            {formatMoodTimeDisplay(time)}
                                            {localTimes.length > 1 ? (
                                                <button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={() => handleChipDelete(i)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-full text-[#7D7589] hover:bg-white/90 hover:text-[#8B4A4A] transition-colors disabled:opacity-50"
                                                    aria-label={`Remove reminder at ${formatMoodTimeDisplay(time)}`}
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            ) : null}
                                        </span>
                                    ))}
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        onClick={() =>
                                            showAddPicker ? setShowAddPicker(false) : openAddPicker()
                                        }
                                        className={`inline-flex items-center gap-1.5 pl-3 pr-3 py-1.5 rounded-full text-sm font-medium transition-colors border-2 border-dashed disabled:opacity-50 ${
                                            showAddPicker
                                                ? 'border-[#8B7A9F] bg-[#F5EEF8] text-[#8B7A9F]'
                                                : 'border-[#D4C8E0] text-[#8B7A9F] hover:border-[#8B7A9F] hover:bg-[#F5EEF8]/80'
                                        }`}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </button>
                                </div>

                                {showAddPicker ? (
                                    <div className="mt-3 rounded-xl border border-[#E8E4F3] bg-white p-4 shadow-md">
                                        <p className="text-xs font-semibold text-[#7D7589] uppercase tracking-wide mb-2">
                                            New reminder time
                                        </p>
                                        <label htmlFor="mood-add-time" className="sr-only">
                                            Choose time for new mood reminder
                                        </label>
                                        <Input
                                            id="mood-add-time"
                                            type="time"
                                            value={draftTime}
                                            onChange={(e) => setDraftTime(e.target.value)}
                                            className="max-w-[11rem] border-[#E8E4F3] rounded-xl text-sm bg-[#FDFBFF] mb-3"
                                        />
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={cancelAddPicker}
                                                className="px-4 py-2 text-sm font-medium text-[#7D7589] hover:text-[#4A4458] rounded-xl transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isSaving}
                                                onClick={confirmAddTime}
                                                className="inline-flex items-center justify-center gap-2 min-w-[7rem] px-4 py-2 text-sm font-medium text-white bg-[#8B7A9F] hover:bg-[#7A6A8E] rounded-xl transition-colors disabled:opacity-60"
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : null}
                                                {isSaving ? 'Saving…' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5EEF8]">
                        <div>
                            <p className="text-sm font-medium text-[#4A4458]">Feeding Reminders</p>
                            <p className="text-xs text-[#7D7589] mt-0.5">Based on baby&apos;s feeding patterns</p>
                        </div>
                        <Switch
                            checked={feedingEnabled}
                            onCheckedChange={handleFeedingToggle}
                            className="data-[state=checked]:bg-[#8B7A9F]"
                        />
                    </div>

                    <div className="flex items-center justify-between px-5 py-4">
                        <div>
                            <p className="text-sm font-medium text-[#4A4458]">Nap Reminders</p>
                            <p className="text-xs text-[#7D7589] mt-0.5">Based on baby&apos;s sleep patterns</p>
                        </div>
                        <Switch
                            checked={napEnabled}
                            onCheckedChange={handleNapToggle}
                            className="data-[state=checked]:bg-[#8B7A9F]"
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
