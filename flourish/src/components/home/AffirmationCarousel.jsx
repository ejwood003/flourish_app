import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listAffirmations } from '@/api/affirmationApi';
import {
    createAffirmationReaction,
    listAffirmationReactions,
    updateAffirmationReaction,
} from '@/api/affirmationReactionApi';
import { listUserProfiles, USER_PROFILES_QUERY_KEY } from '@/api/userProfileApi';
import { pickPrimaryUserProfile } from '@/lib/devUser';

function affirmationId(affirmation) {
    return affirmation.affirmation_id ?? affirmation.affirmationId ?? affirmation.id;
}

function reactionRowId(row) {
    return row.affirmation_reaction_id ?? row.id;
}

export default function AffirmationCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const queryClient = useQueryClient();

    const { data: profiles = [] } = useQuery({
        queryKey: USER_PROFILES_QUERY_KEY,
        queryFn: () => listUserProfiles(),
    });
    const profile = pickPrimaryUserProfile(profiles);
    const userId = profile?.user_id ?? profile?.userId;

    // 1) Load all affirmations from the Affirmation table
    const { data: affirmationsFromDb = [], isLoading: affirmationsLoading } = useQuery({
        queryKey: ['affirmations'],
        queryFn: () => listAffirmations(),
    });

    // 2) Load affirmation reactions for the current user
    const { data: reactionRows = [], isLoading: reactionsLoading } = useQuery({
        queryKey: ['affirmationReactions', userId],
        queryFn: () =>
            listAffirmationReactions({
                filter: { user_id: userId },
            }),
        enabled: Boolean(userId),
    });

    // Build a lookup of the most recent reaction for each affirmation
    const reactionMap = useMemo(() => {
        const map = {};

        for (const row of reactionRows) {
            const aid = row.affirmation_id;
            if (aid && !map[aid]) {
                map[aid] = row;
            }
        }

        return map;
    }, [reactionRows]);

    // 3) Only show affirmations where reaction is "up" or there is no reaction
    // Do NOT show ones with a "down" reaction
    const visibleAffirmations = useMemo(() => {
        return affirmationsFromDb.filter((affirmation) => {
            const existingReaction = reactionMap[affirmationId(affirmation)];
            return !existingReaction || existingReaction.reaction === 'up';
        });
    }, [affirmationsFromDb, reactionMap]);

    // Prevent currentIndex from going out of range when the filtered list changes
    useEffect(() => {
        if (currentIndex >= visibleAffirmations.length) {
            setCurrentIndex(0);
        }
    }, [visibleAffirmations, currentIndex]);

    // Auto-change every 10 seconds
    useEffect(() => {
        if (visibleAffirmations.length === 0) return;

        const interval = setInterval(() => {
            handleNext();
        }, 10000);

        return () => clearInterval(interval);
    }, [currentIndex, visibleAffirmations.length]);

    const handlePrev = () => {
        if (visibleAffirmations.length === 0) return;
        setDirection(-1);
        setCurrentIndex((prev) =>
            prev === 0 ? visibleAffirmations.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        if (visibleAffirmations.length === 0) return;
        setDirection(1);
        setCurrentIndex((prev) =>
            prev === visibleAffirmations.length - 1 ? 0 : prev + 1
        );
    };

    const handleReaction = async (type) => {
        const affirmation = visibleAffirmations[currentIndex];
        if (!affirmation || !userId) return;

        const affId = affirmationId(affirmation);
        const existingReaction = reactionMap[affId];

        try {
            if (existingReaction) {
                await updateAffirmationReaction(reactionRowId(existingReaction), {
                    reaction: type,
                });
            } else {
                await createAffirmationReaction({
                    affirmation_id: affId,
                    user_id: userId,
                    reaction: type,
                });
            }

            await queryClient.invalidateQueries({ queryKey: ['affirmationReactions'] });

            // If they thumbs-down the current affirmation, move away from it
            if (type === 'down') {
                setDirection(1);
                setCurrentIndex(0);
            }
        } catch (e) {
            console.error('Failed to save reaction:', e);
        }
    };

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

        if (isLeftSwipe) handleNext();
        if (isRightSwipe) handlePrev();
    };

    const currentAffirmation = visibleAffirmations[currentIndex];
    const currentReaction = currentAffirmation
        ? reactionMap[affirmationId(currentAffirmation)]?.reaction
        : null;

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

    if (affirmationsLoading || reactionsLoading) {
        return (
            <div className="bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] rounded-3xl p-6 shadow-sm">
                <p className="text-[#4A4458]">Loading affirmations...</p>
            </div>
        );
    }

    if (visibleAffirmations.length === 0) {
        return (
            <div className="bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] rounded-3xl p-6 shadow-sm">
                <p className="text-xs font-medium text-[#5A4B70] uppercase tracking-wide">
                    Daily Affirmation
                </p>
                <p className="text-[#4A4458] mt-4">
                    No affirmations available right now.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] rounded-3xl p-6 shadow-sm">
            <p className="text-xs font-medium text-[#5A4B70] uppercase tracking-wide">
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
                        key={affirmationId(currentAffirmation)}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
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
                    <ChevronLeft className="w-5 h-5 text-[#5A4B70]" />
                </button>

                <div className="flex gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReaction('up')}
                        className={`p-3 rounded-full transition-all duration-200 ${
                            currentReaction === 'up'
                                ? 'bg-[#5A4B70] text-white'
                                : 'bg-white/50 hover:bg-white/80 text-[#5A4B70]'
                        }`}
                    >
                        <ThumbsUp className="w-5 h-5" />
                    </motion.button>

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

                <button
                    onClick={handleNext}
                    className="p-3 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-200 active:scale-95"
                >
                    <ChevronRight className="w-5 h-5 text-[#5A4B70]" />
                </button>
            </div>

            <div className="flex justify-center gap-1.5 mt-4">
                {visibleAffirmations.map((_, idx) => (
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