import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Share2, Info } from 'lucide-react';

export default function SharingSettings({ profile, onUpdate }) {
const shareOptions = [
{ 
    key: 'share_journals', 
    label: 'Journals',
    note: 'You can choose specific entries to share or keep private.'
},
{ key: 'share_mood', label: 'Mood' },
{ key: 'share_baby_tracking', label: 'Baby Tracking' },
];

return (
<div className="bg-white rounded-3xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
    <Share2 className="w-5 h-5 text-[#8B7A9F]" />
    <h3 className="text-lg font-semibold text-[#4A4458]">Support System Sharing</h3>
    </div>
    
    <p className="text-sm text-[#5A4B70] mb-4">
    Control what is shared with your support partner
    </p>

    <div className="space-y-4">
    {shareOptions.map((option) => (
        <div key={option.key} className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-[#F5EEF8]/50 rounded-xl">
            <Label className="text-[#4A4458]">{option.label}</Label>
            <Switch
            checked={profile?.[option.key] ?? false}
            onCheckedChange={(checked) => onUpdate({ [option.key]: checked })}
            className="data-[state=checked]:bg-[#8B7A9F]"
            />
        </div>
        {option.note && profile?.[option.key] && (
            <div className="flex items-start gap-2 pl-3 pr-3">
            <Info className="w-4 h-4 text-[#8B7A9F] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#5A4B70]">{option.note}</p>
            </div>
        )}
        </div>
    ))}
    </div>
</div>
);
}