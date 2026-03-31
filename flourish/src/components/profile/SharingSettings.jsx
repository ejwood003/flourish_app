import React, { useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Share2, ChevronDown, ChevronUp, BookOpen, Heart, Baby } from 'lucide-react';

const shareOptions = [
    {
        key: 'share_journals',
        label: 'Journal Entries',
        description: 'Share your journal with your support person',
        icon: BookOpen,
    },
    {
        key: 'share_mood',
        label: 'Mood',
        description: "Let your support person see how you're feeling",
        icon: Heart,
    },
    {
        key: 'share_baby_tracking',
        label: 'Baby Tracking',
        description: 'Share baby feeds, naps and mood data',
        icon: Baby,
    },
];

function boolShare(p, snake, camel) {
    const v = p?.[snake] ?? p?.[camel];
    return Boolean(v);
}

/**
 * @param {object} props
 * @param {object} props.profile
 * @param {function} props.onSavePatch — async (patch) => void
 * @param {boolean} props.isSaving
 */
export default function SharingSettings({ profile, onSavePatch, isSaving }) {
    const [open, setOpen] = useState(false);
    const [shareJournals, setShareJournals] = useState(() =>
        boolShare(profile, 'share_journals', 'shareJournals'),
    );
    const [shareMood, setShareMood] = useState(() => boolShare(profile, 'share_mood', 'shareMood'));
    const [shareBabyTracking, setShareBabyTracking] = useState(() =>
        boolShare(profile, 'share_baby_tracking', 'shareBabyTracking'),
    );

    const valueByKey = {
        share_journals: shareJournals,
        share_mood: shareMood,
        share_baby_tracking: shareBabyTracking,
    };

    const setByKey = {
        share_journals: setShareJournals,
        share_mood: setShareMood,
        share_baby_tracking: setShareBabyTracking,
    };

    const profileKey = profile?.user_id ?? profile?.userId ?? profile?.id ?? '';

    const syncFromProfile = useCallback(() => {
        setShareJournals(boolShare(profile, 'share_journals', 'shareJournals'));
        setShareMood(boolShare(profile, 'share_mood', 'shareMood'));
        setShareBabyTracking(boolShare(profile, 'share_baby_tracking', 'shareBabyTracking'));
    }, [profile]);

    useEffect(() => {
        syncFromProfile();
    }, [profileKey, syncFromProfile]);

    const sharedCount = shareOptions.filter((o) => valueByKey[o.key]).length;

    const handleToggle = async (key, checked) => {
        const set = setByKey[key];
        const prev = valueByKey[key];
        set(checked);
        try {
            await onSavePatch({ [key]: checked });
        } catch {
            set(prev);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between p-5 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E8E4F3] flex items-center justify-center flex-shrink-0">
                        <Share2 className="w-4 h-4 text-[#8B7A9F]" />
                    </div>
                    <div>
                        <p className="font-semibold text-[#4A4458]">Sharing</p>
                        <p className="text-xs text-[#7D7589] mt-0.5">
                            {sharedCount === 0
                                ? 'Nothing shared'
                                : `${sharedCount} item${sharedCount > 1 ? 's' : ''} shared`}
                        </p>
                    </div>
                </div>
                {open ? (
                    <ChevronUp className="w-4 h-4 text-[#7D7589]" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-[#7D7589]" />
                )}
            </button>

            {open ? (
                <div className="border-t border-[#F5EEF8]">
                    {shareOptions.map((option, idx) => {
                        const Icon = option.icon;
                        const isOn = valueByKey[option.key];
                        return (
                            <div
                                key={option.key}
                                className={`flex items-center gap-4 px-5 py-4 ${
                                    idx < shareOptions.length - 1 ? 'border-b border-[#F5EEF8]' : ''
                                }`}
                            >
                                <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                        isOn ? 'bg-[#E8E4F3]' : 'bg-[#F5EEF8]/50'
                                    }`}
                                >
                                    <Icon
                                        className={`w-4 h-4 ${isOn ? 'text-[#8B7A9F]' : 'text-[#B0A8BD]'}`}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#4A4458]">{option.label}</p>
                                    <p className="text-xs text-[#7D7589] mt-0.5 leading-snug">
                                        {option.description}
                                    </p>
                                </div>
                                <Switch
                                    checked={isOn}
                                    disabled={isSaving}
                                    onCheckedChange={(checked) => handleToggle(option.key, checked)}
                                    className="data-[state=checked]:bg-[#8B7A9F] flex-shrink-0"
                                />
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
