import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const defaultAffirmations = [
{ id: 1, text: "I am exactly who my baby needs." },
{ id: 2, text: "Rest is productive right now." },
{ id: 3, text: "I can be grateful and overwhelmed at the same time." },
{ id: 4, text: "Asking for help is strength." },
{ id: 5, text: "My best is enough today." },
{ id: 6, text: "I am learning alongside my baby." },
{ id: 7, text: "This moment will pass, and I will be okay." },
{ id: 8, text: "I deserve rest and care too." },
];

export default function AffirmationCarousel() {
const [currentIndex, setCurrentIndex] = useState(0);
const [reactions, setReactions] = useState({});
const [direction, setDirection] = useState(0);
const [touchStart, setTouchStart] = useState(null);
const [touchEnd, setTouchEnd] = useState(null);

// Fetch custom affirmations from partner
const { data: customAffirmations = [] } = useQuery({
queryKey: ['customAffirmations'],
queryFn: () => base44.entities.CustomAffirmation.list('-created_date'),
});

// Combine custom affirmations with default ones
const affirmations = [
...customAffirmations.map((a, index) => ({ 
    id: `custom-${a.id}`, 
    text: a.text 
})),
...defaultAffirmations
];

// Auto-change every 10 seconds
React.useEffect(() => {
const interval = setInterval(() => {
    handleNext();
}, 10000);

return () => clearInterval(interval);
}, [currentIndex]);

const handlePrev = () => {
setDirection(-1);
setCurrentIndex((prev) => (prev === 0 ? affirmations.length - 1 : prev - 1));
};

const handleNext = () => {
setDirection(1);
setCurrentIndex((prev) => (prev === affirmations.length - 1 ? 0 : prev + 1));
};

const handleReaction = async (type) => {
const affirmation = affirmations[currentIndex];
setReactions((prev) => ({
    ...prev,
    [affirmation.id]: type,
}));

try {
    await base44.entities.AffirmationReaction.create({
    affirmation_id: affirmation.id,
    reaction: type,
    });
} catch (e) {
    // Silent fail for demo
}
};

// Swipe handlers
const minSwipeDistance = 50;

const onTouchStart = (e) => {
setTouchEnd(null);
setTouchStart(e.targetTouches[0].clientX);
};

const onTouchMove = (e) => {
setTouchEnd(e.targetTouches[0].clientX);
};

const onTouchEnd = () => {
if (!touchStart || !touchEnd) return;

const distance = touchStart - touchEnd;
const isLeftSwipe = distance > minSwipeDistance;
const isRightSwipe = distance < -minSwipeDistance;

if (isLeftSwipe) {
    handleNext();
} else if (isRightSwipe) {
    handlePrev();
}
};

const currentAffirmation = affirmations[currentIndex];
const currentReaction = reactions[currentAffirmation.id];

const variants = {
enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
}),
center: {
    x: 0,
    opacity: 1,
},
exit: (direction) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
}),
};

return (
<div className="bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] rounded-3xl p-6 shadow-sm">
    <p className="text-xs font-medium text-[#8B7A9F] mb-3 uppercase tracking-wide">
    Daily Affirmation
    </p>
    
    <div 
    className="relative h-24 flex items-center justify-center overflow-hidden"
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={onTouchEnd}
    >
    <AnimatePresence mode="wait" custom={direction}>
        <motion.p
        key={currentIndex}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="text-xl font-medium text-[#4A4458] text-center leading-relaxed absolute"
        >
        "{currentAffirmation.text}"
        </motion.p>
    </AnimatePresence>
    </div>

    <div className="flex items-center justify-between mt-4">
    <button
        onClick={handlePrev}
        className="p-3 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-200 active:scale-95"
    >
        <ChevronLeft className="w-5 h-5 text-[#8B7A9F]" />
    </button>

    <div className="flex gap-3">
        <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleReaction('up')}
        className={`p-3 rounded-full transition-all duration-200 ${
            currentReaction === 'up'
            ? 'bg-[#8B7A9F] text-white'
            : 'bg-white/50 hover:bg-white/80 text-[#8B7A9F]'
        }`}
        >
        <ThumbsUp className="w-5 h-5" />
        </motion.button>
        <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleReaction('down')}
        className={`p-3 rounded-full transition-all duration-200 ${
            currentReaction === 'down'
            ? 'bg-[#EDD9E8] text-[#8B7A9F]'
            : 'bg-white/50 hover:bg-white/80 text-[#8B7A9F]'
        }`}
        >
        <ThumbsDown className="w-5 h-5" />
        </motion.button>
    </div>

    <button
        onClick={handleNext}
        className="p-3 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-200 active:scale-95"
    >
        <ChevronRight className="w-5 h-5 text-[#8B7A9F]" />
    </button>
    </div>

    <div className="flex justify-center gap-1.5 mt-4">
    {affirmations.map((_, idx) => (
        <div
        key={idx}
        className={`h-1.5 rounded-full transition-all duration-300 ${
            idx === currentIndex ? 'w-6 bg-[#8B7A9F]' : 'w-1.5 bg-white/50'
        }`}
        />
    ))}
    </div>
</div>
);
}