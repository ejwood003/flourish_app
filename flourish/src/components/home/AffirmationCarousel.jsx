import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

// Affirmation List
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
    // Track component state
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

    // Functionality to go to previous affirmation
    const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? affirmations.length - 1 : prev - 1));
    };

    // Functionality to go to next affirmation
    const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === affirmations.length - 1 ? 0 : prev + 1));
    };

    // Save the thumbs up/down preference
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

    // Current affirmation and reaction
    const currentAffirmation = affirmations[currentIndex];
    const currentReaction = reactions[currentAffirmation.id];

    // Animation variants for swipe transitions
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
        {/* Title  */}
        <p className="text-xs font-medium text-[#5A4B70] uppercase tracking-wide">
        Daily Affirmation
        </p>
        
        <div 
            className="relative h-24 flex items-center justify-center overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Affirmation Text */}
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
            {/* Previous Affirmation Button */}
            <button onClick={handlePrev} className="p-3 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-200 active:scale-95">
                <ChevronLeft className="w-5 h-5 text-[#5A4B70]" />
            </button>

            {/* Reaction Buttons */}
            <div className="flex gap-3">
                {/* Thumbs Up Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction('up')}
                    className={`p-3 rounded-full transition-all duration-200 ${
                        currentReaction === 'up'
                        ? 'bg-[#5A4B70] text-white'
                        : 'bg-white/50 hover:bg-white/80 text-[#5A4B70]'
                    }`}>
                    <ThumbsUp className="w-5 h-5" />
                </motion.button>
                {/* Thumbs Down Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction('down')}
                    className={`p-3 rounded-full transition-all duration-200 ${
                        currentReaction === 'down'
                        ? 'bg-[#5A4B70] text-white'
                        : 'bg-white/50 hover:bg-white/80 text-[#5A4B70]'
                    }`}
                    >
                    <ThumbsDown className="w-5 h-5" />
                </motion.button>
            </div>

            {/* Next Affirmation Button */}
            <button onClick={handleNext} className="p-3 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-200 active:scale-95">
                <ChevronRight className="w-5 h-5 text-[#5A4B70]" />
            </button>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center gap-1.5 mt-4">
            {affirmations.map((_, idx) => (
                <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-6 bg-[#5A4B70]' : 'w-1.5 bg-white/50'
                }`}
                />
            ))}
        </div>
    </div>
    );
}