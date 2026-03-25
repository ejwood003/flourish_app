// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBabyActivity } from '@/api/babyActivityApi';
import { createBabyMood } from '@/api/babyMoodApi';
import { createBabyProfile, listBabyProfiles } from '@/api/babyProfileApi';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Baby, Milk, Moon, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    const [feedingData, setFeedingData] = useState(
        { startTime: null, endTime: null, notes: '', type: 'breastfeed', breast_side: 'left' });
    const [napData, setNapData] = useState({ startTime: null, endTime: null, notes: '' });
    const [moodData, setMoodData] = useState({ mood_value: 50, tags: [] });
    const [moodSaveError, setMoodSaveError] = useState('');

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
            setFeedingData({ ...feedingData, startTime: new Date().toISOString() });
        };
        const endFeeding = () => {
            const endTime = new Date().toISOString();
            setFeedingData({ ...feedingData, endTime });
            setShowFeedingForm(true);
            setFeedingTimer(null);
        };
        const saveFeeding = async () => {
            try {
            const bid = await ensureBabyId();
            if (!bid) return;
            const duration = Math.round((new Date(feedingData.endTime) - new Date(feedingData.startTime)) / 60000);
            createActivityMutation.mutate({
            baby_id: bid,
            user_id: userId,
            type: feedingData.type,
            timestamp: feedingData.startTime,
            duration_minutes: duration,
            notes: feedingData.notes,
            breast_side: feedingData.type === 'breastfeed' ? feedingData.breast_side : undefined
            });
            setShowFeedingForm(false);
            setFeedingData({ startTime: null, endTime: null, notes: '', type: 'breastfeed', breast_side: 'left' });
            } catch (e) {
            console.error('Save feeding failed', e);
            }
        };
        const discardFeeding = () => {
            setShowFeedingForm(false);
            setFeedingData({ startTime: null, endTime: null, notes: '', type: 'breastfeed', breast_side: 'left' });
        };

    // NAP FUNCTIONS
        const startNap = () => {
            setNapTimer(new Date().toISOString());
            setNapData({ ...napData, startTime: new Date().toISOString() });
        };
        const endNap = () => {
            const endTime = new Date().toISOString();
            setNapData({ ...napData, endTime });
            setShowNapForm(true);
            setNapTimer(null);
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
            } catch (e) {
            console.error('Save nap failed', e);
            }
        };
        const discardNap = () => {
            setShowNapForm(false);
            setNapData({ startTime: null, endTime: null, notes: '' });
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
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            {/* Title */}
            <div className="flex items-center gap-2 mb-4">
                <Baby className="w-5 h-5 text-[#C9B6CC]" />
                <p className="text-xs font-medium text-[#5A4B70] uppercase tracking-wide">
                    Quick Actions
                </p>
            </div>

            {/* Basic Three buttons  */}
            <div className="grid grid-cols-3 gap-3">
                {/* Feeding Button */}
                <button
                    type="button"
                    onClick={feedingTimer ? endFeeding : startFeeding}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                        feedingTimer
                        ? 'bg-[#EDD9E8] text-[#4A4458]'
                        : 'bg-gradient-to-br from-[#EDD9E8] to-[#F5E6EA] text-[#4A4458] hover:shadow-md'
                    }`}>
                    <Milk className="w-6 h-6" />
                    <span className="text-xs font-medium text-center">
                        {feedingTimer ? 'End Feeding' : 'Start Feeding'}
                    </span>
                    {feedingTimer && (
                        <Clock className="w-3 h-3 animate-pulse" />
                    )}
                </button>
                {/* Nap Button */}
                <button
                    type="button"
                    onClick={napTimer ? endNap : startNap}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                        napTimer
                        ? 'bg-[#D9EEF2] text-[#4A4458]'
                        : 'bg-gradient-to-br from-[#EDD9E8] to-[#E8E4F3] text-[#4A4458] hover:shadow-md'
                    }`}>
                    <Moon className="w-6 h-6" />
                    <span className="text-xs font-medium text-center">
                        {napTimer ? 'End Nap' : 'Start Nap'}
                    </span>
                    {napTimer && (
                        <Clock className="w-3 h-3 animate-pulse" />
                    )}
                </button>
                {/* Mood Button */} 
                <button
                    type="button"
                    onClick={() => {
                        setMoodSaveError('');
                        setShowMoodEntry(true);
                    }}
                    className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#E8E4F3] to-[#D9EEF2] text-[#4A4458] hover:shadow-md transition-all">
                    <Baby className="w-6 h-6" />
                    <span className="text-xs font-medium text-center">Baby Mood</span>
                </button>
            </div>

            {/* Expandable form shown after ending a feeding session */}
            {showFeedingForm && (
                <div className="mt-4 p-4 bg-[#F6F4FB] rounded-2xl space-y-3">
                    <p className="text-sm font-medium text-[#4A4458]">Log Feeding</p>
                    {/* Select FeedingType */}
                    <Select value={feedingData.type} onValueChange={(value) => setFeedingData({ ...feedingData, type: value })}>
                        <SelectTrigger className="bg-white text-sm font-medium ">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="breastfeed">Breastfeeding</SelectItem>
                            <SelectItem value="bottle">Bottle</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Select Side (if applicable) */}
                    {feedingData.type === 'breastfeed' && (
                        <Select value={feedingData.breast_side} onValueChange={(value) => setFeedingData({ ...feedingData, breast_side: value })}>
                            <SelectTrigger className="bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                    {/* Notes  */}
                    <label htmlFor="feeding-notes" className="sr-only">Feeding notes</label>
                    <Textarea
                        id="feeding-notes"
                        name="feeding-notes"
                        placeholder="Add notes (optional)"
                        value={feedingData.notes}
                        onChange={(e) => setFeedingData({ ...feedingData, notes: e.target.value })}
                        className="bg-white border-[#E8E4F3]"
                    />
                    
                    <div className="flex gap-2">
                        <Button type="button" onClick={discardFeeding} variant="outline" className="flex-1 hover:bg-[#8B7FA8] hover:text-white">
                            Discard
                        </Button>
                        <Button type="button" onClick={saveFeeding} className="flex-1 bg-[#9C90B8] hover:bg-[#8B7FA8]">
                            Save
                        </Button>
                    </div>
                </div>
            )}

            {/* Expandable form shown after ending a nap */}
            {showNapForm && (
                <div className="mt-4 p-4 bg-[#F6F4FB] rounded-2xl space-y-3">
                    <p className="text-sm font-medium text-[#4A4458]">Log Nap</p>
                    
                    <label htmlFor="nap-notes" className="sr-only">Nap notes</label>
                    <Textarea
                        id="nap-notes"
                        name="nap-notes"
                        placeholder="Add notes (optional)"
                        value={napData.notes}
                        onChange={(e) => setNapData({ ...napData, notes: e.target.value })}
                        className="bg-white border-[#E8E4F3]"
                    />
                    
                    <div className="flex gap-2">
                        <Button type="button" onClick={discardNap} variant="outline" className="flex-1 hover:bg-[#8B7FA8] hover:text-white">
                        Discard
                        </Button>
                        <Button type="button" onClick={saveNap} className="flex-1 bg-[#9C90B8] hover:bg-[#8B7FA8]">
                        Save
                        </Button>
                    </div>
                </div>
            )}

            {/* Mood entry: slider (0–100) plus optional tags */}
            {showMoodEntry && (
                <div className="mt-4 p-4 bg-[#F6F4FB] rounded-2xl space-y-4">
                    <p className="text-sm font-medium text-[#4A4458]">How is baby feeling?</p>

                    {/* Emoji Slider */}
                    <div className="space-y-2">
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
                                        mood_value: parseInt(e.target.value, 10)
                                    })
                                }
                                onMouseDown={() => setIsBabyMoodDragging(true)}
                                onMouseUp={() => setIsBabyMoodDragging(false)}
                                onTouchStart={() => setIsBabyMoodDragging(true)}
                                onTouchEnd={() => setIsBabyMoodDragging(false)}
                                className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
                            />

                            <motion.div
                                className="absolute top-0 w-12 h-12 -mt-2 bg-white rounded-full shadow-lg border-2 border-[#5A4B70] pointer-events-none flex items-center justify-center text-xl z-10"
                                style={{ left: `calc(${moodData.mood_value}% - 24px)` }}
                                animate={{ scale: isBabyMoodDragging ? 1.15 : 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                {BABY_MOOD_EMOJIS[Math.min(Math.floor(moodData.mood_value / 25), 4)]}
                            </motion.div>
                        </div>

                        <div className="flex justify-between text-xs text-[#5A4B70] mb-2">
                            <span>Upset</span>
                            <span>Okay</span>
                            <span>Happy</span>
                        </div>

                        <p className="text-center text-sm text-[#4A4458]">
                            {moodData.mood_value}/100
                        </p>
                    </div>

                    {/* Mood Chips */}
                    <div className="space-y-2">
                        <p className="text-xs text-[#4A4458]">What is baby feeling?</p>
                        <div className="flex flex-wrap gap-2">
                            {BABY_MOOD_CHIPS.map((chip) => (
                                <button
                                    type="button"
                                    key={chip}
                                    onClick={() => toggleMoodTag(chip)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                        moodData.tags.includes(chip)
                                            ? 'bg-[#5A4B70] text-white'
                                            : 'bg-white text-[#5A4B70] hover:bg-[#E8E4F3]'
                                    }`}
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Save/Cancel Buttons */}
                    {moodSaveError ? (
                        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
                            {moodSaveError}
                        </p>
                    ) : null}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            onClick={() => {
                                setMoodSaveError('');
                                setShowMoodEntry(false);
                            }}
                            variant="outline"
                            className="flex-1 hover:bg-[#8B7FA8] hover:text-white"
                            disabled={createBabyMoodMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={saveMood}
                            className="flex-1 bg-[#9C90B8] hover:bg-[#8B7FA8]"
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