// @ts-nocheck
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Smile, Baby, BookOpen, Milk, Moon, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';
import EditMoodDialog from '@/components/calendar/EditMoodDialog';
import EditBabyActivityDialog from '@/components/calendar/EditBabyActivityDialog';
import { deleteMoodEntry, updateMoodEntry } from '@/api/moodApi';
import { deleteBabyActivity, updateBabyActivity } from '@/api/babyActivityApi';
import { deleteBabyMood } from '@/api/babyMoodApi';
import { deleteJournalEntry } from '@/api/journalEntryApi';
import { journalEntryCreatedAt, journalEntryId } from '@/lib/journalEntryFields';

/** API returns snake_case (.NET); older Base44 data may be camel/snake — support both. */
function moodEntryId(m) {
    return m?.mood_entry_id ?? m?.MoodEntryId;
}
function moodNumericValue(m) {
    const v = m?.mood_value ?? m?.MoodValue;
    const n = typeof v === 'number' ? v : parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}
function moodTextLabel(m) {
    return m?.mood_label ?? m?.MoodLabel;
}
function moodTimeOfDay(m) {
    return m?.time ?? m?.Time ?? '';
}

const iconMap = {
    breastfeed: Baby,
    bottle: Milk,
    nap: Moon,
    other: MoreHorizontal,
};

/** Mood row/dot tints — same purple / pink / blue family as Home & SupportWidget; #4A4458 body text passes ~4.5:1 on these. */
const getMoodColor = (value) => {
    if (value <= 20) return 'bg-[#E8E4F3]';
    if (value <= 40) return 'bg-[#EDD9E8]';
    if (value <= 60) return 'bg-[#F5EEF8]';
    if (value <= 80) return 'bg-[#D9EEF2]';
    return 'bg-[#DCEAF0]';
};

const getMoodLabel = (value) => {
    if (value <= 20) return 'Struggling';
    if (value <= 40) return 'Low';
    if (value <= 60) return 'Okay';
    if (value <= 80) return 'Good';
    return 'Great';
};

const getActivityColor = (type) => {
    if (type === 'breastfeed' || type === 'bottle') return 'bg-[#F5E6EA]';
    if (type === 'nap') return 'bg-[#D9EEF2]';
    return 'bg-[#E8E4F3]';
};

function babyActivityId(a) {
    return a?.baby_activity_id ?? a?.id;
}

function babyActivityTimestamp(a) {
    return a?.timestamp ?? a?.Timestamp;
}

function babyMoodRowId(m) {
    return m?.baby_mood_id ?? m?.id;
}

function babyMoodTimestamp(m) {
    return m?.timestamp ?? m?.Timestamp;
}

function babyMoodNumericValue(m) {
    const v = m?.mood_value ?? m?.MoodValue;
    const n = typeof v === 'number' ? v : parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function babyMoodTags(m) {
    const t = m?.tags ?? m?.Tags;
    return Array.isArray(t) ? t : [];
}

export default function DayDetailsDropdowns({ moodEntries, babyActivities, babyMoods = [], journalEntries }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [expandedSection, setExpandedSection] = useState('mood');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, id: null });
    const [editMoodDialog, setEditMoodDialog] = useState({ open: false, mood: null });
    const [editActivityDialog, setEditActivityDialog] = useState({ open: false, activity: null });

    const handleDeleteMood = async () => {
        try {
            await deleteMoodEntry(deleteDialog.id);
            queryClient.invalidateQueries({ queryKey: ['moodEntries'] });
        } catch (error) {
            console.error('Error deleting mood:', error);
        }
        setDeleteDialog({ open: false, type: null, id: null });
    };

    const handleDeleteActivity = async () => {
        try {
            await deleteBabyActivity(deleteDialog.id);
            queryClient.invalidateQueries({ queryKey: ['babyActivities'] });
        } catch (error) {
            console.error('Error deleting activity:', error);
        }
        setDeleteDialog({ open: false, type: null, id: null });
    };

    const handleDeleteBabyMood = async () => {
        try {
            await deleteBabyMood(deleteDialog.id);
            queryClient.invalidateQueries({ queryKey: ['babyMoods'] });
        } catch (error) {
            console.error('Error deleting baby mood:', error);
        }
        setDeleteDialog({ open: false, type: null, id: null });
    };

    const handleDeleteJournal = async () => {
        try {
            await deleteJournalEntry(deleteDialog.id);
            queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
            queryClient.invalidateQueries({ queryKey: ['journalEntriesCalendar'] });
        } catch (error) {
            console.error('Error deleting journal:', error);
        }
        setDeleteDialog({ open: false, type: null, id: null });
    };

    const handleUpdateMood = async (updatedMood) => {
        try {
            const id = moodEntryId(updatedMood);
            if (!id) return;
            await updateMoodEntry(id, updatedMood);
            queryClient.invalidateQueries({ queryKey: ['moodEntries'] });
            setEditMoodDialog({ open: false, mood: null });
        } catch (error) {
            console.error('Error updating mood:', error);
        }
    };

    const handleUpdateActivity = async (updatedActivity) => {
        try {
            const id = babyActivityId(updatedActivity);
            if (!id) return;
            await updateBabyActivity(id, {
                type: updatedActivity.type,
                timestamp: updatedActivity.timestamp,
                duration_minutes: updatedActivity.duration_minutes,
                notes: updatedActivity.notes ?? null,
                breast_side: updatedActivity.breast_side ?? null,
                amount_oz: updatedActivity.amount_oz ?? null,
                food_type: updatedActivity.food_type ?? null,
                food_amount: updatedActivity.food_amount ?? null,
                custom_type: updatedActivity.custom_type ?? null,
            });
            queryClient.invalidateQueries({ queryKey: ['babyActivities'] });
            setEditActivityDialog({ open: false, activity: null });
        } catch (error) {
            console.error('Error updating activity:', error);
        }
    };

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const avgMood = moodEntries.length > 0
        ? Math.round(moodEntries.reduce((sum, m) => sum + moodNumericValue(m), 0) / moodEntries.length)
        : null;

    const babyTimelineItems = useMemo(() => {
        const rows = [
            ...babyActivities.map((data) => ({
                kind: 'activity',
                data,
                ts: new Date(babyActivityTimestamp(data) || 0).getTime(),
            })),
            ...(babyMoods || []).map((data) => ({
                kind: 'babyMood',
                data,
                ts: new Date(babyMoodTimestamp(data) || 0).getTime(),
            })),
        ];
        rows.sort((a, b) => a.ts - b.ts);
        return rows;
    }, [babyActivities, babyMoods]);

    const babySectionCount = babyTimelineItems.length;

    return (
        <div className="space-y-3">
        {/* Mood Section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <button
            onClick={() => toggleSection('mood')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#F5EEF8] transition-colors"
            >
            <div className="flex items-center gap-3">
                <Smile className="w-5 h-5 text-[#8B7A9F]" />
                <span className="font-medium text-[#4A4458]">Mood</span>
                {moodEntries.length > 0 && (
                <span className="text-xs bg-[#E8E4F3] px-2 py-0.5 rounded-full text-[#5A4B70]">
                    {moodEntries.length}
                </span>
                )}
            </div>
            {expandedSection === 'mood' ? (
                <ChevronUp className="w-5 h-5 text-[#5A4B70]" />
            ) : (
                <ChevronDown className="w-5 h-5 text-[#5A4B70]" />
            )}
            </button>
            
            {expandedSection === 'mood' && (
            <div className="px-4 pb-4 space-y-3">
                {avgMood && moodEntries.length > 1 && (
                <div className="p-3 bg-[#F5EEF8] rounded-xl">
                    <p className="text-xs text-[#5A4B70] mb-1">Daily Average Mood</p>
                    <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getMoodColor(avgMood)}`} />
                    <span className="font-medium text-[#4A4458]">{getMoodLabel(avgMood)}</span>
                    </div>
                </div>
                )}
                
                {moodEntries.length === 0 ? (
                <p className="text-sm text-[#5A4B70] text-center py-4">No mood entries</p>
                ) : (
                <div className="space-y-2">
                    {moodEntries.map((mood, index) => (
                    <div key={moodEntryId(mood) || index} className="flex items-center justify-between p-2 bg-[#F6F4FB] rounded-lg group">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${getMoodColor(moodNumericValue(mood))}`} />
                            <div>
                                <span className="text-sm text-[#4A4458]">
                                    {moodTextLabel(mood) || getMoodLabel(moodNumericValue(mood))}
                                </span>
                                <p className="text-xs text-[#5A4B70]">{Math.round(moodNumericValue(mood) / 10)}/10</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#5A4B70]">
                                {moodTimeOfDay(mood) || '—'}
                            </span>
                            <button
                                onClick={() => setEditMoodDialog({ open: true, mood })}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#E8E4F3] rounded transition-all"
                            >
                                <Edit className="w-3.5 h-3.5 text-[#8B7A9F]" />
                            </button>
                            <button
                                onClick={() => setDeleteDialog({ open: true, type: 'mood', id: moodEntryId(mood) })}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#F5E6EA] rounded transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5 text-[#5A4B70]" />
                            </button>
                        </div>
                    </div>
                ))}
                </div>
                )}
            </div>
            )}
        </div>

        {/* Baby Activities Section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <button
            onClick={() => toggleSection('baby')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#F5EEF8] transition-colors"
            >
            <div className="flex items-center gap-3">
                <Baby className="w-5 h-5 text-[#8B7A9F]" />
                <span className="font-medium text-[#4A4458]">Baby Activities</span>
                {babySectionCount > 0 && (
                <span className="text-xs bg-[#E8E4F3] px-2 py-0.5 rounded-full text-[#5A4B70]">
                    {babySectionCount}
                </span>
                )}
            </div>
            {expandedSection === 'baby' ? (
                <ChevronUp className="w-5 h-5 text-[#5A4B70]" />
            ) : (
                <ChevronDown className="w-5 h-5 text-[#5A4B70]" />
            )}
            </button>
            
            {expandedSection === 'baby' && (
            <div className="px-4 pb-4 space-y-2">
                {babySectionCount === 0 ? (
                <p className="text-sm text-[#5A4B70] text-center py-4">No activities logged</p>
                ) : (
                babyTimelineItems.map((row) => {
                    if (row.kind === 'babyMood') {
                        const mood = row.data;
                        const mv = babyMoodNumericValue(mood);
                        const tags = babyMoodTags(mood);
                        const ts = babyMoodTimestamp(mood);
                        return (
                            <div
                                key={babyMoodRowId(mood)}
                                className={`flex items-start gap-3 p-2 ${getMoodColor(mv)} rounded-lg group`}
                            >
                                <Smile className="w-4 h-4 text-[#8B7A9F] mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-sm font-medium text-[#4A4458]">
                                            Baby mood · {getMoodLabel(mv)} ({mv}/100)
                                        </span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs text-[#5A4B70]">
                                                {ts ? format(new Date(ts), 'h:mm a') : '—'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteDialog({
                                                        open: true,
                                                        type: 'babyMood',
                                                        id: babyMoodRowId(mood),
                                                    })
                                                }
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#F5E6EA] rounded transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-[#5A4B70]" />
                                            </button>
                                        </div>
                                    </div>
                                    {tags.length > 0 && (
                                        <p className="text-xs text-[#5A4B70] mt-1">{tags.join(', ')}</p>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    const activity = row.data;
                    const Icon = iconMap[activity.type] || MoreHorizontal;
                    const activityColor = getActivityColor(activity.type);
                    const actTs = babyActivityTimestamp(activity);
                    return (
                    <div key={babyActivityId(activity)} className={`flex items-start gap-3 p-2 ${activityColor} rounded-lg group`}>
                        <Icon className="w-4 h-4 text-[#8B7A9F] mt-0.5" />
                        <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                            <span className="text-sm font-medium text-[#4A4458] capitalize">
                            {activity.type === 'breastfeed' ? 'Breastfeeding' :
                            activity.type === 'other' ? (activity.custom_type || 'Other') :
                            activity.type}
                            </span>
                            <div className="flex items-center gap-2">
                            <span className="text-xs text-[#5A4B70]">
                            {actTs ? format(new Date(actTs), 'h:mm a') : '—'}
                            </span>
                            <button
                            type="button"
                            onClick={() => setEditActivityDialog({ open: true, activity })}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#E8E4F3] rounded transition-all"
                            >
                            <Edit className="w-3.5 h-3.5 text-[#8B7A9F]" />
                            </button>
                            <button
                            type="button"
                            onClick={() => setDeleteDialog({ open: true, type: 'activity', id: babyActivityId(activity) })}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#F5E6EA] rounded transition-all"
                            >
                            <Trash2 className="w-3.5 h-3.5 text-[#5A4B70]" />
                            </button>
                            </div>
                        </div>
                        {(activity.breast_side || activity.duration_minutes || activity.amount_oz) && (
                            <p className="text-xs text-[#5A4B70] mt-1">
                            {activity.breast_side && `${activity.breast_side}, `}
                            {activity.duration_minutes && `${activity.duration_minutes} min`}
                            {activity.amount_oz && `${activity.amount_oz} oz`}
                            </p>
                        )}
                        {activity.notes && (
                            <p className="text-xs text-[#5A4B70] mt-1 italic">"{activity.notes}"</p>
                        )}
                        </div>
                    </div>
                    );
                })
                )}
            </div>
            )}
        </div>

        {/* Journal Entries Section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <button
            onClick={() => toggleSection('journal')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#F5EEF8] transition-colors"
            >
            <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#8B7A9F]" />
                <span className="font-medium text-[#4A4458]">Journal Entries</span>
                {journalEntries.length > 0 && (
                <span className="text-xs bg-[#E8E4F3] px-2 py-0.5 rounded-full text-[#5A4B70]">
                    {journalEntries.length}
                </span>
                )}
            </div>
            {expandedSection === 'journal' ? (
                <ChevronUp className="w-5 h-5 text-[#5A4B70]" />
            ) : (
                <ChevronDown className="w-5 h-5 text-[#5A4B70]" />
            )}
            </button>
            
            {expandedSection === 'journal' && (
            <div className="px-4 pb-4 space-y-3">
                {journalEntries.length === 0 ? (
                <p className="text-sm text-[#5A4B70] text-center py-4">No journal entries</p>
                ) : (
                journalEntries.map((entry) => {
                    const jeId = journalEntryId(entry);
                    const created = journalEntryCreatedAt(entry);
                    return (
                    <div
                    key={jeId}
                    className="p-3 bg-[#F5EEF8]/50 rounded-xl group"
                    >
                    <div className="flex items-start justify-between mb-2">
                        {entry.prompt && (
                        <p className="text-xs text-[#5A4B70] font-bold">{entry.prompt}</p>
                        )}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            type="button"
                            onClick={() => navigate(`${createPageUrl('Journal')}?edit=${jeId}`)}
                            className="p-1 hover:bg-[#8B7A9F]/10 rounded"
                        >
                            <Edit className="w-3.5 h-3.5 text-[#8B7A9F]" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeleteDialog({ open: true, type: 'journal', id: jeId })}
                            className="p-1 hover:bg-[#F5E6EA] rounded"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-[#5A4B70]" />
                        </button>
                        </div>
                    </div>
                    <p className="text-sm text-[#4A4458] mb-2 line-clamp-3">{entry.content}</p>
                    <p className="text-xs text-[#5A4B70]">
                        {created ? format(created, 'h:mm a') : '—'}
                    </p>
                    </div>
                    );
                })
                )}
            </div>
            )}
        </div>

        <DeleteConfirmationDialog
            open={deleteDialog.open}
            onOpenChange={(open) => setDeleteDialog({ open, type: null, id: null })}
            onConfirm={
            deleteDialog.type === 'mood' ? handleDeleteMood :
            deleteDialog.type === 'activity' ? handleDeleteActivity :
            deleteDialog.type === 'babyMood' ? handleDeleteBabyMood :
            handleDeleteJournal
            }
            title={`Delete ${
                deleteDialog.type === 'mood'
                    ? 'mood entry'
                    : deleteDialog.type === 'activity'
                    ? 'activity'
                    : deleteDialog.type === 'babyMood'
                        ? 'baby mood'
                        : 'journal entry'
            }?`}
            description="This action cannot be undone."
        />

        <EditMoodDialog
            mood={editMoodDialog.mood}
            open={editMoodDialog.open}
            onOpenChange={(open) => setEditMoodDialog({ open, mood: null })}
            onSave={handleUpdateMood}
        />

        <EditBabyActivityDialog
            activity={editActivityDialog.activity}
            open={editActivityDialog.open}
            onOpenChange={(open) => setEditActivityDialog({ open, activity: null })}
            onSave={handleUpdateActivity}
        />
        </div>
    );
    }