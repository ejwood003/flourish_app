    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Heart, Users, ArrowLeft } from 'lucide-react';

    export default function AccountTypeStep({ onNext, onBack }) {
    return (
        <div className="space-y-8 py-12">
        <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#7D7589] hover:text-[#8B7A9F] transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
        </button>

        <div className="space-y-3 text-center">
            <h1 className="text-3xl font-semibold text-[#4A4458]">I am a...</h1>
            <p className="text-lg text-[#7D7589]">Select your account type</p>
        </div>

        <div className="space-y-4 pt-4">
            <button
            onClick={() => onNext({ accountType: 'mother' })}
            className="w-full p-6 bg-gradient-to-br from-[#EDD9E8] to-[#F5E6EA] rounded-3xl hover:shadow-lg transition-all text-left"
            >
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/50 flex items-center justify-center">
                <Heart className="w-7 h-7 text-[#8B7A9F]" />
                </div>
                <div>
                <h3 className="text-xl font-semibold text-[#4A4458]">Mother</h3>
                <p className="text-sm text-[#7D7589]">Track your wellness journey</p>
                </div>
            </div>
            </button>

            <button
            onClick={() => onNext({ accountType: 'support' })}
            className="w-full p-6 bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] rounded-3xl hover:shadow-lg transition-all text-left"
            >
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/50 flex items-center justify-center">
                <Users className="w-7 h-7 text-[#8B7A9F]" />
                </div>
                <div>
                <h3 className="text-xl font-semibold text-[#4A4458]">Support System</h3>
                <p className="text-sm text-[#7D7589]">Connect to support a mother</p>
                </div>
            </div>
            </button>
        </div>
        </div>
    );
    }