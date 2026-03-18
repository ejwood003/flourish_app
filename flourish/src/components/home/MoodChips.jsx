import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const MOOD_OPTIONS = [
{ label: 'Calm' },
{ label: 'Content' },
{ label: 'Happy' },
{ label: 'Grateful' },
{ label: 'Overwhelmed' },
{ label: 'Anxious' },
{ label: 'Tired' },
{ label: 'Irritable' },
{ label: 'Sad' },
{ label: 'Hopeful' },
];

export default function MoodChips() {
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [saved, setSaved] = useState(false);
    const queryClient = useQueryClient();

    const logMoodsMutation = useMutation({
    mutationFn: async (moods) => {
        const now = new Date();
        const promises = moods.map(mood => {
        const moodValue = ['Happy', 'Grateful', 'Hopeful', 'Content'].includes(mood) ? 75 :
                            ['Calm'].includes(mood) ? 60 :
                            ['Tired'].includes(mood) ? 40 :
                            ['Overwhelmed', 'Anxious', 'Irritable'].includes(mood) ? 30 : 20;
        
        return base44.entities.MoodEntry.create({
            mood_value: moodValue,
            date: now.toISOString().split('T')[0],
            time: now.toTimeString().slice(0, 5),
            mood_label: mood,
        });
        });
        return Promise.all(promises);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['moodEntries'] });
        setSaved(true);
        setTimeout(() => {
        setSaved(false);
        setSelectedMoods([]);
        }, 1500);
    },
    });

    const toggleMood = (mood) => {
    setSelectedMoods(prev => 
        prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
    };

    const handleSave = () => {
    if (selectedMoods.length > 0) {
        logMoodsMutation.mutate(selectedMoods);
    }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-[#C9B6CC]" />
            <p className="text-xs font-medium text-[#5A4B70] uppercase tracking-wide">
                How are you feeling?
            </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
            {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMoods.includes(mood.label);
                return (
                <motion.button
                    key={mood.label}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleMood(mood.label)}
                    disabled={logMoodsMutation.isPending}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected ? 'bg-[#A8C5D5] text-[#4A4458]' : 'bg-[#D9EEF2] text-[#4A4458]'
                    }`}
                >
                    {mood.label}
                </motion.button>
                );
            })}
            </div>

            {selectedMoods.length > 0 && (
            <Button
                onClick={handleSave}
                disabled={logMoodsMutation.isPending}
                className={`w-full rounded-xl transition-colors ${
                    saved
                    ? 'bg-[#8B7FA8] hover:bg-[#7D6F99] text-white'
                    : 'bg-[#E8E4F3] hover:bg-[#DDD8EB] text-[#4A4458]'
                }`}
                >
                {saved
                    ? '✓ Saved'
                    : logMoodsMutation.isPending
                    ? 'Saving...'
                    : `Save ${selectedMoods.length} mood${selectedMoods.length > 1 ? 's' : ''}`}
            </Button>
            )}
        </div>
    );
}
