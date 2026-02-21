import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function ConfirmationStep({ onFinish }) {
return (
<div className="text-center space-y-8 py-12">
    <div className="flex justify-center">
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8E4F3] to-[#D9EEF2] flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-[#8B7A9F]" />
    </div>
    </div>

    <div className="space-y-3">
    <h1 className="text-3xl font-semibold text-[#4A4458]">You're all set</h1>
    <p className="text-lg text-[#7D7589]">
        You can update anything anytime in Settings.
    </p>
    </div>

    <div className="pt-8">
    <Button
        onClick={onFinish}
        className="w-full h-12 bg-[#8B7A9F] hover:bg-[#7A6A8F] text-white rounded-2xl text-base"
    >
        Go to Home
    </Button>
    </div>
</div>
);
}