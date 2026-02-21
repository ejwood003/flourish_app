import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const affirmations = [
"You are exactly who your baby needs.",
"Rest is productive right now.",
"You are doing your best.",
"This moment will pass.",
"You deserve care too.",
"You are learning alongside your baby.",
];

export default function GuidedBreathing({ onClose }) {
const [phase, setPhase] = useState('inhale');
const [seconds, setSeconds] = useState(4);
const [cycle, setCycle] = useState(0);
const [affirmationIndex, setAffirmationIndex] = useState(0);

const phases = [
{ name: 'inhale', duration: 4, text: 'Breathe In', color: 'from-[#D9EEF2] to-[#E8E4F3]' },
{ name: 'hold', duration: 7, text: 'Hold', color: 'from-[#E8E4F3] to-[#EDD9E8]' },
{ name: 'exhale', duration: 8, text: 'Breathe Out', color: 'from-[#EDD9E8] to-[#F5E6EA]' },
];

const currentPhaseIndex = phases.findIndex(p => p.name === phase);
const currentPhase = phases[currentPhaseIndex];

useEffect(() => {
const timer = setInterval(() => {
    setSeconds(prev => {
    if (prev <= 1) {
        const nextIndex = (currentPhaseIndex + 1) % phases.length;
        if (nextIndex === 0) {
        setCycle(c => c + 1);
        setAffirmationIndex((prevIndex) => (prevIndex + 1) % affirmations.length);
        }
        setPhase(phases[nextIndex].name);
        return phases[nextIndex].duration;
    }
    return prev - 1;
    });
}, 1000);

return () => clearInterval(timer);
}, [phase]);

const circleScale = phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 0.8;

return (
<motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${currentPhase.color} transition-all duration-1000`}
>
    <button
    onClick={onClose}
    className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-sm rounded-full text-[#4A4458] hover:bg-white/30 transition-colors"
    >
    <X className="w-6 h-6" />
    </button>

    <div className="flex flex-col items-center">
    <motion.div
        animate={{ scale: circleScale }}
        transition={{ duration: currentPhase.duration, ease: 'easeInOut' }}
        className="w-48 h-48 rounded-full bg-white/40 backdrop-blur-md shadow-2xl flex items-center justify-center"
    >
        <div className="text-center">
        <p className="text-4xl font-light text-[#4A4458]">{seconds}</p>
        </div>
    </motion.div>

    <motion.p
        key={phase}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 text-3xl font-light text-[#4A4458]"
    >
        {currentPhase.text}
    </motion.p>

    <p className="mt-6 text-lg text-[#7D7589]">
        Cycle {cycle + 1}
    </p>

    <motion.p
        key={affirmationIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="mt-8 text-center text-lg text-[#4A4458] max-w-md px-6 italic"
    >
        "{affirmations[affirmationIndex]}"
    </motion.p>
    </div>
</motion.div>
);
}