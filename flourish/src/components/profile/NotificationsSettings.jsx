import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, Bell } from 'lucide-react';

export default function NotificationsSettings({ profile, onUpdate }) {
const addTime = (field) => {
const times = profile?.[field] || [];
onUpdate({ [field]: [...times, '09:00'] });
};

const removeTime = (field, index) => {
const times = profile?.[field] || [];
onUpdate({ [field]: times.filter((_, i) => i !== index) });
};

const updateTime = (field, index, value) => {
const times = [...(profile?.[field] || [])];
times[index] = value;
onUpdate({ [field]: times });
};

return (
<div className="bg-white rounded-3xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
    <Bell className="w-5 h-5 text-[#5A4B70]" />
    <h3 className="text-lg font-semibold text-[#4A4458]">Edit Notifications</h3>
    </div>

    <div className="space-y-6">
    {/* Mood Check-In */}
    <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[#F5EEF8]/50 rounded-xl">
        <div>
            <Label className="text-[#4A4458]">Daily Mood Check-In</Label>
            <p className="text-xs text-[#5A4B70] mt-1">Remind me to check in</p>
        </div>
        <Switch
            checked={profile?.notifications_mood_enabled ?? true}
            onCheckedChange={(checked) => onUpdate({ notifications_mood_enabled: checked })}
            className="data-[state=checked]:bg-[#5A4B70]"
        />
        </div>
        {profile?.notifications_mood_enabled && (
        <div className="space-y-2 pl-3">
            {(profile?.notifications_mood_times || ['09:00']).map((time, index) => (
            <div key={index} className="flex items-center gap-2">
                <label htmlFor={`mood-time-${index}`} className="sr-only">Mood reminder time {index + 1}</label>
                <Input
                    id={`mood-time-${index}`}
                    name={`mood-time-${index}`}
                    type="time"
                    value={time}
                    onChange={(e) => updateTime('notifications_mood_times', index, e.target.value)}
                    className="flex-1 border-[#E8E4F3]"
                />
                <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTime('notifications_mood_times', index)}
                className="text-[#5A4B70] hover:text-[#5A4B70]"
                >
                <X className="w-4 h-4" />
                </Button>
            </div>
            ))}
            <Button
            variant="outline"
            size="sm"
            onClick={() => addTime('notifications_mood_times')}
            className="text-[#5A4B70] border-[#E8E4F3]"
            >
            <Plus className="w-4 h-4 mr-2" />
            Add Time
            </Button>
        </div>
        )}
    </div>

    {/* Feeding Reminders */}
    <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[#F5EEF8]/50 rounded-xl">
        <div>
            <Label className="text-[#4A4458]">Feeding Reminders</Label>
            <p className="text-xs text-[#5A4B70] mt-1">Based on app estimates</p>
        </div>
        <Switch
            checked={profile?.notifications_feeding_enabled ?? false}
            onCheckedChange={(checked) => onUpdate({ notifications_feeding_enabled: checked })}
            className="data-[state=checked]:bg-[#5A4B70]"
        />
        </div>
    </div>

    {/* Nap Reminders */}
    <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[#F5EEF8]/50 rounded-xl">
        <div>
            <Label className="text-[#4A4458]">Nap Reminders</Label>
            <p className="text-xs text-[#5A4B70] mt-1">Based on app estimates</p>
        </div>
        <Switch
            checked={profile?.notifications_nap_enabled ?? false}
            onCheckedChange={(checked) => onUpdate({ notifications_nap_enabled: checked })}
            className="data-[state=checked]:bg-[#5A4B70]"
        />
        </div>
    </div>
    </div>
</div>
);
}