import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, MessageCircle } from 'lucide-react';

export default function OverwhelmedButton() {
const [isOpen, setIsOpen] = useState(false);
const [breathPhase, setBreathPhase] = useState('inhale');
const [notified, setNotified] = useState(false);

const startBreathing = () => {
setIsOpen(true);
let phase = 'inhale';
const interval = setInterval(() => {
    phase = phase === 'inhale' ? 'exhale' : 'inhale';
    setBreathPhase(phase);
}, 4000);

setTimeout(() => {
    clearInterval(interval);
}, 60000);

return () => clearInterval(interval);
};

const handleNotifyPartner = () => {
setNotified(true);
setTimeout(() => setNotified(false), 3000);
};

return (
<>
    <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={startBreathing}
    className="w-full py-4 rounded-2xl bg-[#F2D7D9]/50 text-[#9D8AA5] font-medium flex items-center justify-center gap-2 hover:bg-[#F2D7D9]/70 transition-all duration-200"
    >
    <Heart className="w-5 h-5" />
    Feeling overwhelmed?
    </motion.button>

    <AnimatePresence>
    {isOpen && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setIsOpen(false)}
        >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-[#E8DFF5] to-[#F2D7D9] rounded-3xl p-8 w-full max-w-sm shadow-2xl"
        >
            <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
            >
            <X className="w-5 h-5 text-[#5A4B70]" />
            </button>

            <div className="text-center">
            <p className="text-sm font-medium text-[#5A4B70] mb-6 uppercase tracking-wide">
                Breathe with me
            </p>

            <div className="relative mb-6 flex justify-center">
                <motion.div
                animate={{
                    scale: breathPhase === 'inhale' ? 1.3 : 1,
                    opacity: breathPhase === 'inhale' ? 0.8 : 0.5,
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-[#D4E5F7] to-[#E8DFF5] flex items-center justify-center"
                >
                <motion.span
                    key={breathPhase}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg font-medium text-[#4A4458]"
                >
                    {breathPhase === 'inhale' ? 'Breathe in...' : 'Breathe out...'}
                </motion.span>
                </motion.div>
            </div>

            <p className="text-[#4A4458] font-medium mb-6 leading-relaxed">
                "This moment will pass. You are doing your best, and that is enough."
            </p>

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleNotifyPartner}
                className={`w-full py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                notified
                    ? 'bg-[#D9EEF2] text-[#5A4B70]'
                    : 'bg-white text-[#5A4B70] hover:bg-white/80'
                }`}
            >
                <MessageCircle className="w-5 h-5" />
                {notified ? 'Partner notified ✓' : 'Notify Partner'}
            </motion.button>
            </div>
        </motion.div>
        </motion.div>
    )}
    </AnimatePresence>
</>
);
}