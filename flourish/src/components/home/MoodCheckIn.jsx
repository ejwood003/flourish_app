import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Heart, Smile } from 'lucide-react';


const emojis = ['😔', '😕', '😐', '🙂', '😊'];

export default function MoodCheckIn() {
    const [moodValue, setMoodValue] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleMoodChange = (e) => {
        const value = parseInt(e.target.value);
        setMoodValue(value);
        setSaved(false);
    };

    const handleSave = async () => {
        try {
            await base44.entities.MoodEntry.create({
                mood_value: moodValue,
                date: new Date().toISOString().split('T')[0],
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            // Silent fail
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
            <p className="text-[#4A4458] font-medium text-xs mb-6">How are you feeling today?</p>


            <div className="relative mb-6">
                <div className="h-8 rounded-full bg-gradient-to-r from-[#D9EEF2] via-[#E8E4F3] to-[#EDD9E8] overflow-hidden" />
                <label htmlFor="mood-checkin-slider" className="sr-only">Mood value</label>
                <input
                    id="mood-checkin-slider"
                    name="mood-checkin-slider"
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

            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className={`w-full py-3 rounded-2xl font-medium transition-all duration-300 ${saved
                        ? 'bg-[#D9EEF2] text-[#5A4B70]'
                        : 'bg-[#E8E4F3] text-[#5A4B70] hover:bg-[#DDD8EB]'
                    }`}
            >
                {saved ? '✓ Saved' : 'Save Mood'}
            </motion.button>
        </div>

    );
}