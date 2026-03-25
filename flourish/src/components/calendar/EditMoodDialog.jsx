import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const emojis = ['😔', '😕', '😐', '🙂', '😊'];

export default function EditMoodDialog({ mood, open, onOpenChange, onSave }) {
    const [moodValue, setMoodValue] = useState(50);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [moodLabel, setMoodLabel] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    React.useEffect(() => {
        if (mood) {
            setMoodValue(mood.mood_value || 50);
            setDate(mood.date || '');
            setTime(mood.time || '');
            setMoodLabel(mood.mood_label || '');
        }
    }, [mood]);

    const getMoodLabel = (value) => {
        if (value <= 20) return 'Struggling';
        if (value <= 40) return 'Low';
        if (value <= 60) return 'Okay';
        if (value <= 80) return 'Good';
        return 'Great';
    };

    const handleMoodChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setMoodValue(value);
        setMoodLabel(getMoodLabel(value));
    };

    const handleSave = () => {
        onSave({
            ...mood,
            mood_value: moodValue,
            date,
            time,
            mood_label: moodLabel || getMoodLabel(moodValue),
        });
        onOpenChange(false);
    };

    const emojiIndex = Math.min(Math.floor(moodValue / 25), 4);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white rounded-3xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-[#4A4458]">Edit Mood Entry</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <Label htmlFor="mood-value" className="text-[#4A4458] mb-2 block">
                            Mood Value
                        </Label>

                        <div className="relative mb-6">
                            <div className="h-8 rounded-full bg-gradient-to-r from-[#D9EEF2] via-[#E8E4F3] to-[#EDD9E8] overflow-hidden" />
                            <input
                                id="mood-value"
                                name="mood-value"
                                type="range"
                                min="0"
                                max="100"
                                value={moodValue}
                                onChange={handleMoodChange}
                                onMouseDown={() => setIsDragging(true)}
                                onMouseUp={() => setIsDragging(false)}
                                onTouchStart={() => setIsDragging(true)}
                                onTouchEnd={() => setIsDragging(false)}
                                className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
                            />
                            <motion.div
                                className="absolute top-0 w-12 h-12 -mt-2 bg-white rounded-full shadow-lg border-2 border-[#5A4B70] pointer-events-none flex items-center justify-center text-xl z-10"
                                style={{ left: `calc(${moodValue}% - 24px)` }}
                                animate={{ scale: isDragging ? 1.15 : 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                {emojis[emojiIndex]}
                            </motion.div>
                        </div>

                        <div className="flex justify-between text-xs text-[#5A4B70] mb-2">
                            <span>Struggling</span>
                            <span>Okay</span>
                            <span>Great</span>
                        </div>

                        <p className="text-center text-sm text-[#7D7589] mt-2">
                            {moodValue}/100 • {getMoodLabel(moodValue)}
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="date" className="text-[#4A4458]">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>

                    <div>
                        <Label htmlFor="time" className="text-[#4A4458]">Time</Label>
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>

                    <div>
                        <Label htmlFor="label" className="text-[#4A4458]">Mood Label (optional)</Label>
                        <Input
                            id="label"
                            value={moodLabel}
                            onChange={(e) => setMoodLabel(e.target.value)}
                            placeholder="e.g. Calm, Overwhelmed, Tired"
                            className="rounded-xl"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="flex-1 bg-[#8B7A9F] hover:bg-[#7A6A8E]"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}