import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smile } from 'lucide-react';
import { createMoodEntry } from '@/api/moodApi';
// import { useAuth } from '@/lib/AuthContext'; // use this if your auth context has the current user

const emojis = ['😔', '😕', '😐', '🙂', '😊'];

export default function MoodCheckIn() {
    const [moodValue, setMoodValue] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // Replace this with your actual logged-in user's ID from AuthContext
    const userId = "PUT-REAL-USER-GUID-HERE";

    const handleMoodChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setMoodValue(value);
        setSaved(false);
        setError('');
    };

    const getMoodLabel = (value) => {
        if (value <= 20) return 'Struggling';
        if (value <= 40) return 'Low';
        if (value <= 60) return 'Okay';
        if (value <= 80) return 'Good';
        return 'Great';
    };

    const handleSave = async () => {
        try {
            if (!userId) {
                throw new Error('Missing user ID');
            }

            const now = new Date();
            const date = now.toISOString().split('T')[0];
            const time = now.toTimeString().slice(0, 5);

            await createMoodEntry({
                mood_value: moodValue,
                date: date,
                time: time,
                mood_label: getMoodLabel(moodValue),
                user_id: userId,
            });

            setSaved(true);
            setError('');
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error('Failed to save mood entry:', e);
            setError('Could not save mood.');
        }
    };

    const emojiIndex = Math.min(Math.floor(moodValue / 25), 4);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <Smile className="w-5 h-5 text-[#C9B6CC]" />
                <p className="text-xs font-medium text-[#5F5670] uppercase tracking-wide">
                    Mood Check-In
                </p>
            </div>

            <p className="text-[#4A4458] font-medium text-xs mb-6">
                How are you feeling today?
            </p>

            <div className="relative mb-6">
                <div className="h-8 rounded-full bg-gradient-to-r from-[#D9EEF2] via-[#E8E4F3] to-[#EDD9E8] overflow-hidden" />
                <input
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

            <div className="flex justify-between text-xs text-[#5A4B70] mb-4">
                <span>Struggling</span>
                <span>Okay</span>
                <span>Great</span>
            </div>

            {error && (
                <p className="text-sm text-red-500 mb-3">{error}</p>
            )}

            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className={`w-full py-3 rounded-2xl font-medium transition-all duration-300 ${
                    saved
                        ? 'bg-[#D9EEF2] text-[#5A4B70]'
                        : 'bg-[#E8E4F3] text-[#5A4B70] hover:bg-[#DDD8EB]'
                }`}
            >
                {saved ? '✓ Saved' : 'Save Mood'}
            </motion.button>
        </div>
    );
}