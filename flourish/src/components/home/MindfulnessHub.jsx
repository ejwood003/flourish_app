import { useState } from 'react';
import { Sparkles, Wind, BookOpen, Play, Moon, Heart, Brain } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

const meditationTypes = [
    { id: 'general', label: 'General', icon: Sparkles },
    { id: 'breastfeeding', label: 'Breastfeeding', icon: Heart },
    { id: 'sleep', label: 'Sleep', icon: Moon },
];

const meditationDurations = [
    { id: 5, label: '5 min' },
    { id: 10, label: '10 min' },
    { id: 15, label: '15 min' },
];

export default function MindfulnessHub({ onBreathingStart }) {
    const navigate = useNavigate();
    const [showMeditationModal, setShowMeditationModal] = useState(false);
    const [meditationType, setMeditationType] = useState(null);
    const [meditationLength, setMeditationLength] = useState(null);

    const handleStartMeditation = () => {
    if (meditationType && meditationLength) {
        navigate(
        createPageUrl('LiveMeditation') +
            `?type=${meditationType}&duration=${meditationLength}&from=home`
        );
        setShowMeditationModal(false);
        setMeditationType(null);
        setMeditationLength(null);
    }
    };

    const canStart = meditationType && meditationLength;

    return (
        <>
            <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#C9B6CC]" />
                <p className="text-xs font-medium text-[#5A4B70] uppercase tracking-wide">
                Mindfulness
                </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <button
                    type="button"
                    onClick={() => setShowMeditationModal(true)}
                    className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] rounded-2xl hover:shadow-md transition-all"
                    >
                    <Sparkles className="w-6 h-6 text-[#5A4B70]" />
                    <span className="text-xs font-medium text-[#4A4458]">Meditation</span>
                </button>

                <button
                    type="button"
                    onClick={onBreathingStart}
                    className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] rounded-2xl hover:shadow-md transition-all"
                    >
                    <Wind className="w-6 h-6 text-[#5A4B70]" />
                    <span className="text-xs font-medium text-[#4A4458]">Breathing</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate(createPageUrl('Journal'))}
                    className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-[#EDD9E8] to-[#F5E6EA] rounded-2xl hover:shadow-md transition-all"
                    >
                    <BookOpen className="w-6 h-6 text-[#5A4B70]" />
                    <span className="text-xs font-medium text-[#4A4458]">Journaling</span>
                </button>
            </div>
            </div>

            <Dialog
            open={showMeditationModal}
            onOpenChange={(open) => {
                setShowMeditationModal(open);
                if (!open) {
                setMeditationType(null);
                setMeditationLength(null);
                }
            }}
            >
            <DialogContent className="bg-white rounded-3xl p-6 max-w-xl border-none">
                <DialogHeader className="mb-2">
                <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-[#C9B6CC]" />
                    <DialogTitle className="text-xs font-medium text-[#5F5670] uppercase tracking-wide">
                    Daily Meditation
                    </DialogTitle>
                </div>
                </DialogHeader>

                {/* Step 1 */}
                <div className="mb-4">
                <p className="text-sm font-medium text-[#4A4458] mb-3">
                    Step 1: Choose type
                </p>
                <div className="flex gap-2">
                    {meditationTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = meditationType === type.id;

                    return (
                        <motion.button
                        key={type.id}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setMeditationType(type.id);
                            setMeditationLength(null);
                        }}
                        className={`flex-1 py-3 px-2 rounded-2xl flex flex-col items-center gap-2 transition-all duration-200 ${
                            isSelected
                            ? 'bg-[#7D6F99] text-white shadow-md hover:bg-[#6F618A]'
                            : 'bg-[#E8E4F3] text-[#4A4458] hover:bg-[#DDD8EB]'
                        }`}
                        >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{type.label}</span>
                        </motion.button>
                    );
                    })}
                </div>
                </div>

                {/* Step 2 */}
                <AnimatePresence>
                {meditationType && (
                    <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                    >
                    <p className="text-sm font-medium text-[#4A4458] mb-3">
                        Step 2: Choose duration
                    </p>
                    <div className="flex gap-2">
                        {meditationDurations.map((duration) => {
                        const isSelected = meditationLength === duration.id;

                        return (
                            <motion.button
                            key={duration.id}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setMeditationLength(duration.id)}
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
                    onClick={handleStartMeditation}
                    className="w-full py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all duration-300 bg-[#7D6F99] text-white shadow-md hover:bg-[#6F618A] hover:shadow-lg"
                    >
                    <Play className="w-5 h-5" fill="currentColor" />
                    Start Meditation
                    </motion.button>
                )}
                </AnimatePresence>
            </DialogContent>
            </Dialog>
        </>
    );
}
