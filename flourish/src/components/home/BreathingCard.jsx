import React from 'react';
import { Wind } from 'lucide-react';

export default function BreathingCard({ onStart }) {
return (
<div className="bg-white rounded-3xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
    <Wind className="w-5 h-5 text-[#5A4B70]" />
    <p className="text-xs font-medium text-[#5A4B70] uppercase tracking-wide">
        Guided Breathing
    </p>
    </div>

    <button
    onClick={onStart}
    className="w-full py-4 bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] rounded-2xl text-[#4A4458] font-medium hover:shadow-md transition-all"
    >
    Start Breathing Exercise
    </button>
</div>
);
}