import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smile } from 'lucide-react';
import { createMoodEntry } from '@/api/moodApi';

const emojis = ['😔', '😕', '😐', '🙂', '😊'];

/**
 * Local testing: optional override. Must exist in `UserProfiles`. Dev seed uses 11111111-1111-1111-1111-111111111111.
 * Leave empty to use `userId` from `Home`.
 */
const TEMP_MOOD_USER_ID_FOR_TESTING = '11111111-1111-1111-1111-111111111111';

export default function MoodCheckIn({ userId }) {
    const [moodValue, setMoodValue] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

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

    /** Local calendar date (YYYY-MM-DD); avoid UTC shift from `toISOString().split('T')[0]`. */
    const formatLocalYmd = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const handleSave = async () => {
        try {
            const effectiveUserId = TEMP_MOOD_USER_ID_FOR_TESTING.trim() || userId;

            if (!effectiveUserId) {
                setError('No profile id. Set TEMP_MOOD_USER_ID_FOR_TESTING or finish onboarding so Home passes userId.');
                return;
            }

            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            // API uses JsonNamingPolicy.SnakeCaseLower — keys must be snake_case or UserId won't bind (FK fails).
            const payload = {
                mood_value: moodValue,
                date: formatLocalYmd(now),
                time: timeStr,
                mood_label: getMoodLabel(moodValue),
                user_id: effectiveUserId,
            };

            await createMoodEntry(payload);
    
            setSaved(true);
            setError('');
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error('Failed to save mood entry:', e);
            setError(e.message || 'Could not save mood.');
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

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

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