import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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

export default function Home() {
    const navigate = useNavigate();
    const [showBreathing, setShowBreathing] = useState(false); // set breathing to false to hide the breathing card

    // Get the user's profiles
    const { data: profiles = [], refetch } = useQuery({
        queryKey: ['userProfiles'],
        queryFn: () => base44.entities.UserProfile.list(),
    });

    // Force refetch on mount
    React.useEffect(() => {
        refetch();
    }, [refetch]);

    // Set the profile and default features
    const profile = profiles[0];
    const defaultFeatures = ['affirmation', 'mood', 'mood_chips', 'mindfulness', 'tasks', 'baby', 'support', 'breathing', 'journal', 'meditations', 'articles'];
    const enabledFeatures = profile?.home_features || defaultFeatures;

    // Render the features based on the enabled features/order
    const renderFeature = (featureId) => {
        switch (featureId) {
        case 'affirmation':
            return <AffirmationCarousel key={featureId} />;
        case 'mood':
            return <MoodCheckIn key={featureId} />;
        case 'mood_chips':
            return <MoodChips key={featureId} />;
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
                {/* Dynamic Features ("Cards") */}
                {enabledFeatures.map((featureId) => {
                const feature = renderFeature(featureId);
                return feature;
                })}

                {/* View Partner Screen Button */}
                <button onClick={() => navigate(createPageUrl('PartnerHome'))} className="w-full py-3 px-4 rounded-2xl text-sm font-medium text-black hover:text-black bg-[#F5EEF8]/30 hover:bg-[#F5EEF8]/50 transition-all flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Partner Screen
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