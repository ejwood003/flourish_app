import React, { useState } from 'react';
import { Sparkles, Wind, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MindfulnessHub({ onBreathingStart }) {
const navigate = useNavigate();
const [showMeditationModal, setShowMeditationModal] = useState(false);
const [meditationType, setMeditationType] = useState('');
const [meditationLength, setMeditationLength] = useState('');

const handleStartMeditation = () => {
if (meditationType && meditationLength) {
    navigate(createPageUrl('LiveMeditation') + `?type=${meditationType}&duration=${meditationLength}&from=home`);
    setShowMeditationModal(false);
    setMeditationType('');
    setMeditationLength('');
}
};

return (
<>
    <div className="bg-white rounded-3xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#8B7A9F]" />
        <p className="text-xs font-medium text-[#8B7A9F] uppercase tracking-wide">
        Mindfulness
        </p>
    </div>

    <div className="grid grid-cols-3 gap-3">
        <button
        onClick={() => setShowMeditationModal(true)}
        className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] rounded-2xl hover:shadow-md transition-all"
        >
        <Sparkles className="w-6 h-6 text-[#8B7A9F]" />
        <span className="text-xs font-medium text-[#4A4458]">Meditation</span>
        </button>

        <button
        onClick={onBreathingStart}
        className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] rounded-2xl hover:shadow-md transition-all"
        >
        <Wind className="w-6 h-6 text-[#8B7A9F]" />
        <span className="text-xs font-medium text-[#4A4458]">Breathing</span>
        </button>

        <button
        onClick={() => navigate(createPageUrl('Journal'))}
        className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-[#EDD9E8] to-[#F5E6EA] rounded-2xl hover:shadow-md transition-all"
        >
        <BookOpen className="w-6 h-6 text-[#8B7A9F]" />
        <span className="text-xs font-medium text-[#4A4458]">Journaling</span>
        </button>
    </div>
    </div>

    <Dialog open={showMeditationModal} onOpenChange={setShowMeditationModal}>
    <DialogContent className="bg-white rounded-3xl p-6">
        <DialogHeader>
        <DialogTitle className="text-[#4A4458] text-center mb-4">Choose Your Meditation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
        <div>
            <p className="text-xs font-medium text-[#7D7589] mb-2 uppercase tracking-wide">Type</p>
            <div className="grid grid-cols-3 gap-2">
            {['general', 'breastfeeding', 'sleep'].map((type) => (
                <button
                key={type}
                onClick={() => setMeditationType(type)}
                className={`py-3 rounded-xl font-medium capitalize transition-all ${
                    meditationType === type
                    ? 'bg-[#8B7A9F] text-white'
                    : 'bg-[#E8E4F3] text-[#7D7589] hover:bg-[#DDD8EB]'
                }`}
                >
                {type}
                </button>
            ))}
            </div>
        </div>

        <div>
            <p className="text-xs font-medium text-[#7D7589] mb-2 uppercase tracking-wide">Length</p>
            <div className="grid grid-cols-3 gap-2">
            {['5', '10', '15'].map((length) => (
                <button
                key={length}
                onClick={() => setMeditationLength(length)}
                className={`py-3 rounded-xl font-medium transition-all ${
                    meditationLength === length
                    ? 'bg-[#8B7A9F] text-white'
                    : 'bg-[#E8E4F3] text-[#7D7589] hover:bg-[#DDD8EB]'
                }`}
                >
                {length} min
                </button>
            ))}
            </div>
        </div>

        <Button
            onClick={handleStartMeditation}
            disabled={!meditationType || !meditationLength}
            className="w-full bg-[#8B7A9F] hover:bg-[#7A6A8E] text-white rounded-xl py-3 mt-4"
        >
            Start Meditation
        </Button>
        </div>
    </DialogContent>
    </Dialog>
</>
);
}