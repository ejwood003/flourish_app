    import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Switch } from '@/components/ui/switch';
    import { Users, ArrowLeft } from 'lucide-react';

    export default function SupportStep({ data, onNext, onSkip, onBack }) {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        support_type: data.support_type || '',
        support_name: data.support_name || '',
        support_email: data.support_email || '',
        support_phone: data.support_phone || '',
        share_journals: data.share_journals || false,
        share_mood: data.share_mood || false,
        share_baby_tracking: data.share_baby_tracking || false,
    });

    const supportTypes = [
        { value: 'partner', label: 'Partner' },
        { value: 'nanny', label: 'Nanny' },
        { value: 'friend', label: 'Friend' },
        { value: 'mother', label: 'Mother' },
        { value: 'other', label: 'Other' },
    ];

    const handleContinue = () => {
        onNext(formData);
    };

    return (
        <div className="space-y-6">
        <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#7D7589] hover:text-[#8B7A9F] transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
        </button>

        <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-[#D9EEF2] flex items-center justify-center">
                <Users className="w-7 h-7 text-[#8B7A9F]" />
            </div>
            </div>
            <h2 className="text-2xl font-semibold text-[#4A4458]">
            Would you like to add someone to support you?
            </h2>
            <p className="text-[#7D7589]">You can share updates and get help</p>
        </div>

        {!showForm ? (
            <div className="space-y-3">
            <Button
                onClick={() => setShowForm(true)}
                className="w-full h-12 bg-[#8B7A9F] hover:bg-[#7A6A8F] text-white rounded-2xl text-base"
            >
                Yes, add support person
            </Button>
            
            <Button
                onClick={() => onSkip({ skipSupport: true })}
                variant="outline"
                className="w-full h-12 border-[#E8E4F3] text-[#7D7589] hover:bg-[#F5EEF8] rounded-2xl text-base"
            >
                Not right now
            </Button>
            </div>
        ) : (
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
            <div className="space-y-2">
                <Label className="text-[#4A4458]">Type of Support</Label>
                <div className="grid grid-cols-2 gap-2">
                {supportTypes.map((type) => (
                    <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, support_type: type.value })}
                    className={`py-3 px-4 rounded-xl border-2 transition-all text-sm ${
                        formData.support_type === type.value
                        ? 'border-[#8B7A9F] bg-[#F5EEF8] text-[#4A4458]'
                        : 'border-[#E8E4F3] text-[#7D7589] hover:border-[#D9D4E3]'
                    }`}
                    >
                    {type.label}
                    </button>
                ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="support_name" className="text-[#4A4458]">Full Name</Label>
                <Input
                id="support_name"
                value={formData.support_name}
                onChange={(e) => setFormData({ ...formData, support_name: e.target.value })}
                placeholder="Their name"
                className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="support_email" className="text-[#4A4458]">Email</Label>
                <Input
                id="support_email"
                type="email"
                value={formData.support_email}
                onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                placeholder="their@email.com"
                className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="support_phone" className="text-[#7D7589]">
                Phone Number <span className="text-xs">(Optional)</span>
                </Label>
                <Input
                id="support_phone"
                type="tel"
                value={formData.support_phone}
                onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
                />
            </div>

            <div className="pt-4 space-y-4">
                <Label className="text-[#4A4458]">What would you like to share?</Label>
                
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor="share_journals" className="text-[#7D7589]">Journals</Label>
                    <Switch
                    id="share_journals"
                    checked={formData.share_journals}
                    onCheckedChange={(checked) => setFormData({ ...formData, share_journals: checked })}
                    className="data-[state=checked]:bg-[#8B7A9F]"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label htmlFor="share_mood" className="text-[#7D7589]">Mood</Label>
                    <Switch
                    id="share_mood"
                    checked={formData.share_mood}
                    onCheckedChange={(checked) => setFormData({ ...formData, share_mood: checked })}
                    className="data-[state=checked]:bg-[#8B7A9F]"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label htmlFor="share_baby_tracking" className="text-[#7D7589]">Baby Tracking</Label>
                    <Switch
                    id="share_baby_tracking"
                    checked={formData.share_baby_tracking}
                    onCheckedChange={(checked) => setFormData({ ...formData, share_baby_tracking: checked })}
                    className="data-[state=checked]:bg-[#8B7A9F]"
                    />
                </div>
                </div>
            </div>

            <Button
                onClick={handleContinue}
                className="w-full h-12 bg-[#8B7A9F] hover:bg-[#7A6A8F] text-white rounded-2xl text-base mt-2"
            >
                Continue
            </Button>
            </div>
        )}
        </div>
    );
    }