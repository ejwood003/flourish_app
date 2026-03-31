// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    listUserProfiles,
    updateUserProfile,
    USER_PROFILES_QUERY_KEY,
} from '@/api/userProfileApi';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Eye } from 'lucide-react';

// Import all "cards" from the home section
import AffirmationCarousel from '@/components/home/AffirmationCarousel';
import MoodCheckIn from '@/components/home/MoodCheckIn';
import MoodChips from '@/components/home/MoodChips';
import MeditationSelector from '@/components/home/MeditationSelector';
import GuidedBreathing from '@/components/home/GuidedBreathing';
import BreathingCard from '@/components/home/BreathingCard';
import JournalCard from '@/components/home/JournalCard';
import SupportWidget from '@/components/home/SupportWidget';
import UpcomingTasks from '@/components/home/UpcomingTasks';
import RecommendedArticle from '@/components/home/RecommendedArticle';
import MindfulnessHub from '@/components/home/MindfulnessHub';
import BabyQuickActions from '@/components/home/BabyQuickActions';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
    DEFAULT_HOME_FEATURES,
    isIncompleteStoredHomeFeatures,
    resolveHomeFeatureOrder,
    sanitizeHomeFeatureIds,
} from '@/lib/homeFeatures';

export default function Home() {
    useDocumentTitle('Home');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showBreathing, setShowBreathing] = useState(false); // set breathing to false to hide the breathing card

    const { userId: sessionUserId } = useCurrentUserId();

    const { data: profiles = [], refetch } = useQuery({
        queryKey: [...USER_PROFILES_QUERY_KEY, 'mine', sessionUserId],
        queryFn: () =>
            listUserProfiles({
                filter: { user_id: sessionUserId },
                limit: 10,
            }),
        enabled: Boolean(sessionUserId),
    });

    const { mutate: repairHomeFeatures, isPending: repairHomeFeaturesPending } = useMutation({
        mutationFn: ({ userId }) =>
            updateUserProfile(userId, { home_features: [...DEFAULT_HOME_FEATURES] }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_PROFILES_QUERY_KEY });
        },
    });

    // Force refetch on mount
    React.useEffect(() => {
        refetch();
    }, [refetch]);

    const profile = profiles[0];

    const storedFeatures = profile?.home_features ?? profile?.homeFeatures;
    const homeFeaturesSerialized = JSON.stringify(storedFeatures ?? null);

    // Persist full `home_features` when SQLite still has a 1–2 id fragment so Profile / refetch match the UI.
    useEffect(() => {
        const userId = profile?.user_id ?? profile?.userId;
        if (!userId || repairHomeFeaturesPending) return;
        const cleaned = sanitizeHomeFeatureIds(
            profile?.home_features ?? profile?.homeFeatures,
            DEFAULT_HOME_FEATURES,
        );
        if (!isIncompleteStoredHomeFeatures(cleaned, DEFAULT_HOME_FEATURES)) {
            return;
        }
        repairHomeFeatures({ userId });
    }, [
        profile?.user_id,
        profile?.userId,
        homeFeaturesSerialized,
        repairHomeFeaturesPending,
        repairHomeFeatures,
    ]);

    const enabledFeatures = resolveHomeFeatureOrder(
        storedFeatures,
        DEFAULT_HOME_FEATURES,
    );

    // Render the features based on the enabled features/order
    const renderFeature = (featureId) => {
        switch (featureId) {
        case 'affirmation':
            return <AffirmationCarousel key={featureId} />;
        case 'mood':
            return (
                <MoodCheckIn
                    key={featureId}
                    userId={profile?.user_id ?? profile?.userId ?? sessionUserId}
                />
            );
        case 'mood_chips':
            return (
                <MoodChips
                    key={featureId}
                    userId={profile?.user_id ?? profile?.userId ?? sessionUserId}
                />
            );
        case 'baby':
            return <BabyQuickActions key={featureId} />;
        case 'meditations':
            return <MeditationSelector key={featureId} />;
        case 'breathing':
            return <BreathingCard key={featureId} onStart={() => setShowBreathing(true)} />;
        case 'journal':
            return <JournalCard key={featureId} />;
        case 'support':
            return <SupportWidget key={featureId} />;
        case 'tasks':
            return <UpcomingTasks key={featureId} />;
        case 'articles':
            return <RecommendedArticle key={featureId} />;
        case 'mindfulness':
            return <MindfulnessHub key={featureId} onBreathingStart={() => setShowBreathing(true)} />;
        default:
            return null;
        }
    };

    return (
        <>
            <div className="space-y-6 pb-8">
                <h1 className="text-2xl font-semibold text-[#4A4458]">Home</h1>
                {/* Dynamic Features ("Cards") */}
                {enabledFeatures.map((featureId) => {
                const feature = renderFeature(featureId);
                return feature;
                })}

                {/* Edit Home Screen Button */}
                <button
                    type="button"
                    onClick={() => navigate(createPageUrl('EditHome'))}
                    className="w-full py-3 px-4 rounded-2xl text-sm font-medium text-black hover:text-black bg-[#F5EEF8]/30 hover:bg-[#F5EEF8]/50 transition-all flex items-center justify-center gap-2"
                >
                    <Eye className="w-4 h-4" />
                    Edit Home Screen
                </button>
            </div>

            {/* Guided Breathing Modal */}
            <AnimatePresence>
                {showBreathing && (
                <GuidedBreathing onClose={() => setShowBreathing(false)} />
                )}
            </AnimatePresence>
        </>
    );
}