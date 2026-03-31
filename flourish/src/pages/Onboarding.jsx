import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAuth } from '@/lib/auth';
import { APP_SHELL_MAX_WIDTH_CLASS, createPageUrl } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import { postLogin, verifySupportConnection } from '@/api/authApi';
import { createUserProfile } from '@/api/userProfileApi';
import { createSupportProfile } from '@/api/supportProfileApi';

import SignInStep from '@/components/onboarding/SignInStep';
import AccountTypeStep from '@/components/onboarding/AccountTypeStep';
import SupportAccountStep from '@/components/onboarding/SupportAccountStep';
import MomInfoStep from '@/components/onboarding/MomInfoStep';
import BabyInfoStep from '@/components/onboarding/BabyInfoStep';
import SupportStep from '@/components/onboarding/SupportStep';
import NotificationsStep from '@/components/onboarding/NotificationsStep';
import InterestsStep from '@/components/onboarding/InterestsStep';
import ConfirmationStep from '@/components/onboarding/ConfirmationStep';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

function splitFullName(fullName) {
    const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
    const userFirstName = parts[0] || '';
    const userLastName = parts.slice(1).join(' ') || '';
    return { userFirstName, userLastName };
}

export default function Onboarding() {
    useDocumentTitle('Onboarding');
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(0);
    const [viewMode, setViewMode] = useState('accountType');
    const [booted, setBooted] = useState(false);
    const [formData, setFormData] = useState({
        accountType: '',
        full_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        password: '',
        baby_full_name: '',
        baby_date_of_birth: '',
        baby_gender: '',
        skipBaby: false,
        support_type: '',
        support_name: '',
        support_email: '',
        support_phone: '',
        share_journals: false,
        share_mood: false,
        share_baby_tracking: false,
        skipSupport: false,
        notifications_mood_enabled: true,
        notifications_mood_times: ['09:00'],
        notifications_feeding_enabled: false,
        notifications_feeding_times: [],
        notifications_nap_enabled: false,
        notifications_nap_times: [],
        selectedInterests: [],
    });

    useEffect(() => {
        const st = location.state;
        if (!st?.fromWelcome && !st?.startAtSignIn) {
            navigate('/Welcome', { replace: true });
            return;
        }
        setViewMode(st.startAtSignIn ? 'signin' : 'accountType');
        setBooted(true);
    }, [location.state, navigate]);

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
        mutationFn: async (profileData) => createUserProfile(profileData),
        onSuccess: (created) => {
            const uid = created?.user_id ?? created?.userId;
            const accessToken = created?.access_token ?? created?.accessToken;
            setAuth('mother', uid, accessToken ? { accessToken } : {});
            setCurrentStep(steps.length - 1);
        },
    });

    const registerPartnerMutation = useMutation({
        mutationFn: async ({ yourEmail, password, motherEmail }) => {
            const profile = await createUserProfile({
                username: yourEmail,
                email: yourEmail,
                password,
                user_first_name: '',
                user_last_name: '',
                phone_number: null,
                date_of_birth: null,
                created_by: motherEmail,
            });
            const pid = profile?.user_id ?? profile?.userId;
            if (!pid) throw new Error('Profile create failed');
            await createSupportProfile({
                user_id: pid,
                support_email: yourEmail,
                share_journals: true,
                share_mood: true,
                share_baby_tracking: true,
            });
            return profile;
        },
        onSuccess: (profile) => {
            const uid = profile?.user_id ?? profile?.userId;
            const accessToken = profile?.access_token ?? profile?.accessToken;
            setAuth('partner', uid, accessToken ? { accessToken } : {});
            navigate(createPageUrl('PartnerHome'));
        },
        onError: () => {
            alert('Could not create support account. Try again.');
        },
    });

    const handleSignIn = async ({ username, password }) => {
        try {
            const response = await postLogin({ username, password });
            if (!response.ok) {
                alert('Invalid email or password');
                return;
            }
            const data = await response.json();
            const ut = data.user_type ?? data.userType;
            const uid = data.user_id ?? data.userId;
            const accessToken = data.access_token ?? data.accessToken;
            setAuth(ut, uid, accessToken ? { accessToken } : {});
            if (ut === 'partner') {
                navigate(createPageUrl('PartnerHome'));
            } else {
                navigate(createPageUrl('Home'));
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Something went wrong. Please try again.');
        }
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

    const handleVerifySupportAccount = async (motherEmail, yourEmail) =>
        verifySupportConnection({ motherEmail, supportEmail: yourEmail });

    const handleSupportAccountComplete = (data) => {
        setFormData({ ...formData, ...data });
        registerPartnerMutation.mutate({
            yourEmail: data.yourEmail,
            password: data.password,
            motherEmail: data.motherEmail,
        });
    };

    const handleNext = (stepData) => {
        const newFormData = { ...formData, ...stepData };
        setFormData(newFormData);
        if (currentStep === steps.length - 2) {
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
            navigate('/Welcome');
        }
    };

    const mapInterestsToFeatures = (interests, hasSupport) => {
        const features = ['affirmation'];
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

    const saveProfile = (data) => {
        const homeFeatures = mapInterestsToFeatures(data.selectedInterests, !data.skipSupport);
        const { userFirstName, userLastName } = splitFullName(data.full_name);
        if (!data.email || !data.password) {
            alert('Email and password are required.');
            return;
        }
        const profileData = {
            username: data.email,
            email: data.email,
            password: data.password,
            user_first_name: userFirstName,
            user_last_name: userLastName,
            created_by: data.email,
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

    const renderContent = () => {
        if (viewMode === 'signin') {
            return <SignInStep onSignIn={handleSignIn} onBack={handleBack} />;
        }
        if (viewMode === 'accountType') {
            return (
                <AccountTypeStep
                    onNext={handleAccountTypeSelect}
                    onBack={() => navigate('/Welcome')}
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
        const CurrentStepComponent = steps[currentStep].component;
        return (
            <CurrentStepComponent
                data={formData}
                onNext={handleNext}
                onSkip={handleSkip}
                onBack={handleBack}
                onFinish={() => navigate(createPageUrl('Home'))}
                isLoading={createProfileMutation.isPending || registerPartnerMutation.isPending}
            />
        );
    };

    const showProgress = viewMode === 'onboarding' && currentStep < steps.length - 1;

    if (!booted) {
        return <div className="min-h-screen bg-[#FEF9F5]" aria-busy="true" />;
    }

    return (
        <div className="min-h-screen bg-[#FEF9F5] flex flex-col">
            {showProgress && (
                <div className="pt-6 pb-4 px-4">
                    <div className={`${APP_SHELL_MAX_WIDTH_CLASS} flex justify-center gap-2`}>
                        {steps.slice(0, -1).map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index < currentStep
                                        ? 'w-8 bg-[#8B7A9F]'
                                        : index === currentStep
                                            ? 'w-8 bg-[#8B7A9F]'
                                            : 'w-2 bg-[#E8E4F3]'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}
            <div className="flex-1 flex items-center justify-center px-4">
                <div className={`w-full ${APP_SHELL_MAX_WIDTH_CLASS}`}>{renderContent()}</div>
            </div>
        </div>
    );
}
