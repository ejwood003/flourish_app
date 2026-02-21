    import React from 'react';
    import { useNavigate } from 'react-router-dom';
    import { createPageUrl } from '@/utils';
    import { Heart, UserPlus, Link2, Sparkles } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { base44 } from '@/api/base44Client';

    export default function Welcome() {
    const navigate = useNavigate();

    const handleSignIn = () => {
        base44.auth.redirectToLogin(window.location.origin + createPageUrl('Home'));
    };

    const handleCreateAccount = () => {
        navigate(createPageUrl('Onboarding'));
    };

    const handleConnectPartner = () => {
        navigate(createPageUrl('PartnerConnect'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FEF9F5] via-[#F5EEF8] to-[#E8E4F3] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
            {/* Logo/Header */}
            <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-4">
                <Heart className="w-10 h-10 text-[#8B7A9F]" fill="#8B7A9F" />
            </div>
            <h1 className="text-3xl font-bold text-[#4A4458] mb-2">Postpartum Care</h1>
            <p className="text-[#7D7589]">Your journey to wellness starts here</p>
            </div>

            {/* Options */}
            <div className="space-y-4">
            {/* Sign In */}
            <button
                onClick={handleSignIn}
                className="w-full p-6 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all group"
            >
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B7A9F] to-[#A895B8] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                    <h3 className="font-semibold text-[#4A4458] mb-1">Sign In</h3>
                    <p className="text-sm text-[#7D7589]">Welcome back to your wellness journey</p>
                </div>
                </div>
            </button>

            {/* Create Account */}
            <button
                onClick={handleCreateAccount}
                className="w-full p-6 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all group"
            >
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-6 h-6 text-[#8B7A9F]" />
                </div>
                <div className="text-left flex-1">
                    <h3 className="font-semibold text-[#4A4458] mb-1">Create Account</h3>
                    <p className="text-sm text-[#7D7589]">Start your postpartum wellness journey</p>
                </div>
                </div>
            </button>

            {/* Connect as Support Partner */}
            <button
                onClick={handleConnectPartner}
                className="w-full p-6 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all group"
            >
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EDD9E8] to-[#F5E6EA] flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-6 h-6 text-[#8B7A9F]" />
                </div>
                <div className="text-left flex-1">
                    <h3 className="font-semibold text-[#4A4458] mb-1">Connect to Account</h3>
                    <p className="text-sm text-[#7D7589]">Join as a support partner</p>
                </div>
                </div>
            </button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-[#7D7589] mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
        </div>
        </div>
    );
    }