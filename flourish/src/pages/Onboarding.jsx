    import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { createPageUrl } from '@/utils';
    import { base44 } from '@/api/base44Client';
    import { useMutation, useQuery } from '@tanstack/react-query';

    import WelcomeStep from '@/components/onboarding/WelcomeStep';
    import SignInStep from '@/components/onboarding/SignInStep';
    import AccountTypeStep from '@/components/onboarding/AccountTypeStep';
    import SupportAccountStep from '@/components/onboarding/SupportAccountStep';
    import MomInfoStep from '@/components/onboarding/MomInfoStep';
    import BabyInfoStep from '@/components/onboarding/BabyInfoStep';
    import SupportStep from '@/components/onboarding/SupportStep';
    import NotificationsStep from '@/components/onboarding/NotificationsStep';
    import InterestsStep from '@/components/onboarding/InterestsStep';
    import ConfirmationStep from '@/components/onboarding/ConfirmationStep';

    export default function Onboarding() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [viewMode, setViewMode] = useState('welcome'); // 'welcome', 'signin', 'accountType', 'supportAccount', 'onboarding'
    const [formData, setFormData] = useState({
        // Account type
        accountType: '',
        // Mom info
        full_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        // Baby info
        baby_full_name: '',
        baby_date_of_birth: '',
        baby_gender: '',
        skipBaby: false,
        // Support system
        support_type: '',
        support_name: '',
        support_email: '',
        support_phone: '',
        share_journals: false,
        share_mood: false,
        share_baby_tracking: false,
        skipSupport: false,
        // Notifications
        notifications_mood_enabled: true,
        notifications_mood_times: ['09:00'],
        notifications_feeding_enabled: false,
        notifications_feeding_times: [],
        notifications_nap_enabled: false,
        notifications_nap_times: [],
        // Interests
        selectedInterests: [],
    });

    const motherSteps = [
        { component: MomInfoStep, name: 'Your Info' },
        { component: BabyInfoStep, name: 'Baby Info' },
        { component: SupportStep, name: 'Support' },
        { component: NotificationsStep, name: 'Notifications' },
        { component: InterestsStep, name: 'Personalize' },
        { component: ConfirmationStep, name: 'Done' },
    ];

    const steps = motherSteps;

    const createProfileMutation = useMutation({
        mutationFn: async (profileData) => {
        return await base44.entities.UserProfile.create(profileData);
        },
        onSuccess: () => {
        setCurrentStep(steps.length - 1);
        },
    });

    const handleSignIn = (signInData) => {
        // Handle sign in logic - redirect to home
        console.log('Sign in:', signInData);
        navigate(createPageUrl('Home'));
    };

    const handleAccountTypeSelect = (data) => {
        setFormData({ ...formData, ...data });
        if (data.accountType === 'support') {
        setViewMode('supportAccount');
        } else {
        setViewMode('onboarding');
        setCurrentStep(0);
        }
    };

    const handleVerifySupportAccount = async (motherEmail, yourEmail) => {
        // Check if support email matches what mother provided
        const profiles = await base44.entities.UserProfile.filter({ support_email: yourEmail });
        const motherProfile = profiles.find(p => p.created_by === motherEmail);
        return !!motherProfile;
    };

    const handleSupportAccountComplete = (data) => {
        setFormData({ ...formData, ...data });
        // Create support account and redirect to partner home
        console.log('Support account created:', data);
        navigate(createPageUrl('PartnerHome'));
    };

    const handleNext = (stepData) => {
        const newFormData = { ...formData, ...stepData };
        setFormData(newFormData);

        if (currentStep === steps.length - 2) {
        // Last data-entry step, save profile
        saveProfile(newFormData);
        } else {
        setCurrentStep(currentStep + 1);
        }
    };

    const handleSkip = (skipData = {}) => {
        setFormData({ ...formData, ...skipData });
        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
        } else if (viewMode === 'onboarding') {
        setViewMode('accountType');
        } else if (viewMode === 'supportAccount') {
        setViewMode('accountType');
        } else if (viewMode === 'signin' || viewMode === 'accountType') {
        setViewMode('welcome');
        }
    };

    const saveProfile = (data) => {
        // Map interests to home_features
        const homeFeatures = mapInterestsToFeatures(data.selectedInterests, !data.skipSupport);

        const profileData = {
        username: data.full_name,
        phone_number: data.phone_number || null,
        date_of_birth: data.date_of_birth || null,
        baby_full_name: data.baby_full_name || null,
        baby_date_of_birth: data.baby_date_of_birth || null,
        baby_gender: data.baby_gender || null,
        support_type: data.support_type || null,
        support_name: data.support_name || null,
        support_email: data.support_email || null,
        support_phone: data.support_phone || null,
        share_journals: data.share_journals,
        share_mood: data.share_mood,
        share_baby_tracking: data.share_baby_tracking,
        notifications_mood_enabled: data.notifications_mood_enabled,
        notifications_mood_times: data.notifications_mood_times,
        notifications_feeding_enabled: data.notifications_feeding_enabled,
        notifications_feeding_times: data.notifications_feeding_times,
        notifications_nap_enabled: data.notifications_nap_enabled,
        notifications_nap_times: data.notifications_nap_times,
        home_features: homeFeatures,
        };

        createProfileMutation.mutate(profileData);
    };

    const mapInterestsToFeatures = (interests, hasSupport) => {
        const features = ['affirmation']; // Always include affirmation
        
        if (interests.includes('emotional')) {
        features.push('mood', 'mood_chips');
        }
        
        if (interests.includes('mindfulness')) {
        features.push('mindfulness', 'breathing', 'journal', 'meditations');
        }
        
        if (interests.includes('baby')) {
        features.push('tasks');
        }
        
        if (interests.includes('support') && hasSupport) {
        features.push('support');
        }
        
        if (interests.includes('articles')) {
        features.push('articles');
        }

        return features;
    };

    const renderContent = () => {
        if (viewMode === 'welcome') {
        return (
            <WelcomeStep
            onNext={() => setViewMode('accountType')}
            onSignIn={() => setViewMode('signin')}
            />
        );
        }

        if (viewMode === 'signin') {
        return (
            <SignInStep
            onSignIn={handleSignIn}
            onBack={() => setViewMode('welcome')}
            />
        );
        }

        if (viewMode === 'accountType') {
        return (
            <AccountTypeStep
            onNext={handleAccountTypeSelect}
            onBack={() => setViewMode('welcome')}
            />
        );
        }

        if (viewMode === 'supportAccount') {
        return (
            <SupportAccountStep
            onNext={handleSupportAccountComplete}
            onBack={() => setViewMode('accountType')}
            onVerify={handleVerifySupportAccount}
            />
        );
        }

        // Regular onboarding flow
        const CurrentStepComponent = steps[currentStep].component;
        return (
        <CurrentStepComponent
            data={formData}
            onNext={handleNext}
            onSkip={handleSkip}
            onBack={handleBack}
            onFinish={() => navigate(createPageUrl('Home'))}
            isLoading={createProfileMutation.isPending}
        />
        );
    };

    const showProgress = viewMode === 'onboarding' && currentStep < steps.length - 1;

    return (
        <div className="min-h-screen bg-[#FEF9F5] flex flex-col">
        {/* Progress Indicator */}
        {showProgress && (
            <div className="pt-6 pb-4 px-4">
            <div className="max-w-lg mx-auto flex justify-center gap-2">
                {steps.slice(0, -1).map((_, index) => (
                <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                    index < currentStep ? 'w-8 bg-[#8B7A9F]' : 
                    index === currentStep ? 'w-8 bg-[#8B7A9F]' : 
                    'w-2 bg-[#E8E4F3]'
                    }`}
                />
                ))}
            </div>
            </div>
        )}

        {/* Step Content */}
        <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-lg">
            {renderContent()}
            </div>
        </div>
        </div>
    );
    }