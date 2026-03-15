    import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';

    export default function EditMoodDialog({ mood, open, onOpenChange, onSave }) {
    const [moodValue, setMoodValue] = useState(50);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [moodLabel, setMoodLabel] = useState('');

    React.useEffect(() => {
        if (mood) {
        setMoodValue(mood.mood_value || 50);
        setDate(mood.date || '');
        setTime(mood.time || '');
        setMoodLabel(mood.mood_label || '');
        }
    }, [mood]);

    const handleSave = () => {
        onSave({
        ...mood,
        mood_value: moodValue,
        date,
        time,
        mood_label: moodLabel
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white rounded-3xl p-6">
            <DialogHeader>
            <DialogTitle className="text-[#4A4458]">Edit Mood Entry</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
            <div>
            <Label htmlFor="mood-value" className="text-[#4A4458] mb-2">Mood Value</Label>
            <input
                id="mood-value"
                name="mood-value"
                type="range"
                min="0"
                max="100"
                value={moodValue}
                onChange={(e) => setMoodValue(parseInt(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-[#B8A5C4] via-[#E8E4F3] to-[#A8D5BA] rounded-full appearance-none cursor-pointer"
                />
                <p className="text-center text-sm text-[#7D7589] mt-2">{moodValue}/100</p>
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