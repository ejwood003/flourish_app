// @ts-nocheck
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Baby, Milk, Moon, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BABY_MOOD_CHIPS = ['Calm', 'Happy', 'Fussy', 'Sleepy', 'Playful', 'Cranky', 'Content', 'Alert'];

export default function BabyQuickActions() {
    const queryClient = useQueryClient();
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

    const createActivityMutation = useMutation({
        mutationFn: (data) => base44.entities.BabyActivity.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['babyActivities'] });
        },
    });

    const createBabyMoodMutation = useMutation({
        mutationFn: (data) => base44.entities.BabyMood.create(data),
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
        const saveFeeding = () => {
            const duration = Math.round((new Date(feedingData.endTime) - new Date(feedingData.startTime)) / 60000);
            createActivityMutation.mutate({
            type: feedingData.type,
            timestamp: feedingData.startTime,
            duration_minutes: duration,
            notes: feedingData.notes,
            breast_side: feedingData.type === 'breastfeed' ? feedingData.breast_side : undefined
            });
            setShowFeedingForm(false);
            setFeedingData({ startTime: null, endTime: null, notes: '', type: 'breastfeed', breast_side: 'left' });
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
        const saveNap = () => {
            const duration = Math.round((new Date(napData.endTime) - new Date(napData.startTime)) / 60000);
            createActivityMutation.mutate({
            type: 'nap',
            timestamp: napData.startTime,
            duration_minutes: duration,
            notes: napData.notes
            });
            setShowNapForm(false);
            setNapData({ startTime: null, endTime: null, notes: '' });
        };
        const discardNap = () => {
            setShowNapForm(false);
            setNapData({ startTime: null, endTime: null, notes: '' });
        };

    // MOOD FUNCTIONS
        const saveMood = () => {
            createBabyMoodMutation.mutate({
            mood_value: moodData.mood_value,
            timestamp: new Date().toISOString(),
            tags: moodData.tags
            });
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
                <button onClick={feedingTimer ? endFeeding : startFeeding}
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
                <button onClick={napTimer ? endNap : startNap}
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
                <button onClick={() => setShowMoodEntry(true)}
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
                        <Button onClick={discardFeeding} variant="outline" className="flex-1 hover:bg-[#8B7FA8] hover:text-white">
                            Discard
                        </Button>
                        <Button onClick={saveFeeding} className="flex-1 bg-[#9C90B8] hover:bg-[#8B7FA8]">
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
                        <Button onClick={discardNap} variant="outline" className="flex-1 hover:bg-[#8B7FA8] hover:text-white">
                        Discard
                        </Button>
                        <Button onClick={saveNap} className="flex-1 bg-[#9C90B8] hover:bg-[#8B7FA8]">
                        Save
                        </Button>
                    </div>
                </div>
            )}

            {/* Mood entry: slider (0–100) plus optional tags */}
            {showMoodEntry && (
                <div className="mt-4 p-4 bg-[#F6F4FB] rounded-2xl space-y-4">
                    <p className="text-sm font-medium text-[#4A4458]">How is baby feeling?</p>
                    {/* Bar Slider  */}
                    <div className="space-y-2">
                        <input
                            id="baby-mood-slider"
                            type="range"
                            min="0"
                            max="100"
                            value={moodData.mood_value}
                            onChange={(e) =>
                                setMoodData({ ...moodData, mood_value: parseInt(e.target.value) })
                            }
                            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#8B7FA8]"
                            style={{
                                background: "linear-gradient(to right, #D9EEF2, #E8E4F3, #EDD9E8)"
                            }}
                        />
                        <p className="text-center text-sm text-[#4A4458]">{moodData.mood_value}/100</p>
                    </div>
                    {/* Mood Chips  */}
                    <div className="space-y-2">
                        <p className="text-xs text-[#4A4458]">What is baby feeling?</p>
                        <div className="flex flex-wrap gap-2">
                        {BABY_MOOD_CHIPS.map((chip) => (
                            <button
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
                    {/* Save/Cancel Buttons  */}
                    <div className="flex gap-2">
                        <Button onClick={() => setShowMoodEntry(false)} variant="outline" className="flex-1 hover:bg-[#8B7FA8] hover:text-white">
                            Cancel
                        </Button>
                        <Button onClick={saveMood} className="flex-1 bg-[#9C90B8] hover:bg-[#8B7FA8]">
                            Save
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}