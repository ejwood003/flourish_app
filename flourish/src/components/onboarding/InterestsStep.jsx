    import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Heart, Brain, Baby, Users, Sparkles, BookOpen, ArrowLeft } from 'lucide-react';

    export default function InterestsStep({ data, onNext, isLoading, onBack }) {
    const [selectedInterests, setSelectedInterests] = useState(data.selectedInterests || []);

    const interestCards = [
        {
        id: 'emotional',
        icon: Heart,
        title: 'Emotional check-ins',
        description: 'Mood tracking & mood chips',
        gradient: 'from-[#F5E6EA] to-[#EDD9E8]',
        },
        {
        id: 'mindfulness',
        icon: Brain,
        title: 'Mindfulness tools',
        description: 'Breathing, meditation, journaling',
        gradient: 'from-[#E8E4F3] to-[#D9EEF2]',
        },
        {
        id: 'baby',
        icon: Baby,
        title: 'Baby routine tracking',
        description: 'Feedings, naps, upcoming tasks',
        gradient: 'from-[#D9EEF2] to-[#E8E4F3]',
        },
        {
        id: 'support',
        icon: Users,
        title: 'Partner support',
        description: 'Support suggestions & messaging',
        gradient: 'from-[#EDD9E8] to-[#F5E6EA]',
        hide: data.skipSupport,
        },
        {
        id: 'encouragement',
        icon: Sparkles,
        title: 'Daily encouragement',
        description: 'Affirmations',
        gradient: 'from-[#F5E6EA] to-[#E8E4F3]',
        },
        {
        id: 'articles',
        icon: BookOpen,
        title: 'Helpful articles',
        description: 'Recommended reading',
        gradient: 'from-[#D9EEF2] to-[#EDD9E8]',
        },
    ];

    const toggleInterest = (id) => {
        setSelectedInterests((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleContinue = () => {
        onNext({ selectedInterests });
    };

    return (
        <div className="space-y-6">
        <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#5A4B70] hover:text-[#8B7A9F] transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
        </button>

        <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-[#4A4458]">
            What would you like help with?
            </h2>
            <p className="text-[#5A4B70]">Select all that interest you</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
            {interestCards.filter(card => !card.hide).map((card) => {
            const Icon = card.icon;
            const isSelected = selectedInterests.includes(card.id);

            return (
                <button
                key={card.id}
                onClick={() => toggleInterest(card.id)}
                className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all text-left ${
                    isSelected
                    ? 'border-[#8B7A9F] bg-[#F5EEF8]'
                    : 'border-transparent hover:border-[#E8E4F3]'
                }`}
                >
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-[#8B7A9F]" />
                    </div>
                    <div className="flex-1">
                    <h3 className="font-semibold text-[#4A4458] mb-1">{card.title}</h3>
                    <p className="text-sm text-[#5A4B70]">{card.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                        ? 'border-[#8B7A9F] bg-[#8B7A9F]'
                        : 'border-[#E8E4F3]'
                    }`}>
                    {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    </div>
                </div>
                </button>
            );
            })}
        </div>

        <div className="space-y-2 pt-2">
            <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full h-12 bg-[#7D6F99] hover:bg-[#7A6A8F] text-white rounded-2xl text-base"
            >
            {isLoading ? 'Setting up...' : 'Finish Setup'}
            </Button>
            
            <p className="text-center text-xs text-[#5A4B70]">
            You can customize later in Settings
            </p>
        </div>
        </div>
    );
    }