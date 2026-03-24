    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Sparkles } from 'lucide-react';

    export default function WelcomeStep({ onNext, onSignIn }) {
    return (
        <div className="text-center space-y-8 py-12">
        <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-[#8B7A9F]" />
            </div>
        </div>

        <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-[#4A4458]">Welcome</h1>
            <p className="text-lg text-[#5A4B70]">Let's personalize your space.</p>
        </div>

        <div className="space-y-3 pt-8">
            <Button
            onClick={() => onNext({})}
            className="w-full h-12 bg-[#7D6F99] hover:bg-[#7A6A8F] text-white rounded-2xl text-base"
            >
            Get Started
            </Button>
            
            <button 
            onClick={onSignIn}
            className="text-sm text-[#5A4B70] hover:text-[#8B7A9F] transition-colors"
            >
            I already have an account
            </button>
        </div>
        </div>
    );
    }