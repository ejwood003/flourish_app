// Card for quick access to meditation
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Play, Sparkles, Moon, Heart } from 'lucide-react';

// Gather info for the selection prompts
const types = [
    { id: 'general', label: 'General', icon: Sparkles },
    { id: 'breastfeeding', label: 'Breastfeeding', icon: Heart },
    { id: 'sleep', label: 'Sleep', icon: Moon },
];
const durations = [
    { id: 5, label: '5 min' },
    { id: 10, label: '10 min' },
    { id: 15, label: '15 min' },
];

// FUNCTION FOR CARD
export default function MeditationSelector() {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(null);

    const handleStart = () => {
        navigate(createPageUrl('LiveMeditation') + `?type=${selectedType}&duration=${selectedDuration}&from=home`);
    };

    const canStart = selectedType && selectedDuration;

    return (
        // Title 
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-[#C9B6CC]" />
                <p className="text-xs font-medium text-[#5F5670] uppercase tracking-wide">
                    Daily Meditation
                </p>
            </div>

            {/* Step 1: Type of meditation Selection */}
            <div className="mb-4">
                <p className="text-sm font-medium text-[#4A4458] mb-3">Step 1: Choose type</p>
                <div className="flex gap-2">
                {types.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;

                    // Meditation Type Buttons
                    return (
                        <motion.button
                            key={type.id}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedType(type.id)}
                            className={`flex-1 py-3 px-2 rounded-2xl flex flex-col items-center gap-2 transition-all duration-200 ${
                            isSelected
                                ? 'bg-[#7D6F99] text-white shadow-md hover:bg-[#6F618A]'
                                : 'bg-[#E8E4F3] text-[#4A4458] hover:bg-[#DDD8EB]'
                            }`}>
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{type.label}</span>
                        </motion.button>
                    );
                })}
                </div>
            </div>

            {/* Step 2: Duration Selection */}
            <AnimatePresence>
                {selectedType && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden">
                    <p className="text-sm font-medium text-[#4A4458] mb-3">Step 2: Choose duration</p>
                    <div className="flex gap-2">
                        {durations.map((duration) => {
                            const isSelected = selectedDuration === duration.id;

                            // Time button options
                            return (
                            <motion.button
                                key={duration.id}
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDuration(duration.id)}
                                className={`flex-1 py-3 rounded-full font-medium transition-all duration-200 ${
                                isSelected
                                    ? 'bg-[#D9CDE6] text-[#4A4458] shadow-sm hover:bg-[#D1C2E0]'
                                    : 'bg-[#F7F4FA] text-[#5F5670] hover:bg-[#EEE7F5]'
                                }`}
                            >
                                {duration.label}
                            </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

            {/* Start Button */}
            <AnimatePresence>
                {canStart && (
                <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStart}
                    className="w-full py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all duration-300 bg-[#7D6F99] text-white shadow-md hover:bg-[#6F618A] hover:shadow-lg"
                >
                    <Play className="w-5 h-5" fill="currentColor" />
                    Start Meditation
                </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}  