    import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Switch } from '@/components/ui/switch';
    import { Bell, ArrowLeft } from 'lucide-react';

    export default function NotificationsStep({ data, onNext, onSkip, onBack }) {
    const [formData, setFormData] = useState({
        notifications_mood_enabled: data.notifications_mood_enabled ?? true,
        notifications_mood_times: data.notifications_mood_times || ['09:00'],
        notifications_feeding_enabled: data.notifications_feeding_enabled ?? false,
        notifications_feeding_times: data.notifications_feeding_times || [],
        notifications_nap_enabled: data.notifications_nap_enabled ?? false,
        notifications_nap_times: data.notifications_nap_times || [],
    });

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
            <div className="w-14 h-14 rounded-full bg-[#E8E4F3] flex items-center justify-center">
                <Bell className="w-7 h-7 text-[#8B7A9F]" />
            </div>
            </div>
            <h2 className="text-2xl font-semibold text-[#4A4458]">Notification Preferences</h2>
            <p className="text-[#7D7589]">Stay on track with gentle reminders</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
            <div>
                <Label className="text-[#4A4458]">Daily mood check-ins</Label>
                <p className="text-xs text-[#7D7589] mt-1">Morning reminder at 9:00 AM</p>
            </div>
            <Switch
                checked={formData.notifications_mood_enabled}
                onCheckedChange={(checked) =>
                setFormData({ ...formData, notifications_mood_enabled: checked })
                }
                className="data-[state=checked]:bg-[#8B7A9F]"
            />
            </div>

            <div className="flex items-center justify-between">
            <div>
                <Label className="text-[#4A4458]">Feeding reminders</Label>
                <p className="text-xs text-[#7D7589] mt-1">Custom feeding schedule</p>
            </div>
            <Switch
                checked={formData.notifications_feeding_enabled}
                onCheckedChange={(checked) =>
                setFormData({ ...formData, notifications_feeding_enabled: checked })
                }
                className="data-[state=checked]:bg-[#8B7A9F]"
            />
            </div>

            <div className="flex items-center justify-between">
            <div>
                <Label className="text-[#4A4458]">Nap reminders</Label>
                <p className="text-xs text-[#7D7589] mt-1">Custom nap schedule</p>
            </div>
            <Switch
                checked={formData.notifications_nap_enabled}
                onCheckedChange={(checked) =>
                setFormData({ ...formData, notifications_nap_enabled: checked })
                }
                className="data-[state=checked]:bg-[#8B7A9F]"
            />
            </div>

            <p className="text-xs text-[#7D7589] pt-2">
            You can customize specific times in Settings later
            </p>

            <div className="space-y-2 pt-2">
            <Button
                onClick={handleContinue}
                className="w-full h-12 bg-[#8B7A9F] hover:bg-[#7A6A8F] text-white rounded-2xl text-base"
            >
                Continue
            </Button>

            <Button
                onClick={() => onSkip()}
                variant="ghost"
                className="w-full text-[#7D7589] hover:text-[#8B7A9F] hover:bg-transparent"
            >
                Skip for now
            </Button>
            </div>
        </div>
        </div>
    );
    }