import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Share2 } from 'lucide-react';
import {
    createJournalEntry,
    getJournalEntry,
    updateJournalEntry,
} from '@/api/journalEntryApi';
import { journalEntryId } from '@/lib/journalEntryFields';

const prompts = [
    'What small moment do I want to remember?',
    'What do I need more of right now?',
    'What am I looking forward to?',
    'What made me smile today?',
    'What am I proud of myself for?',
];

export default function NewEntryForm({ userId, onEntryAdded, editEntryId }) {
    const [content, setContent] = useState('');
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [shareWithPartner, setShareWithPartner] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editEntry, setEditEntry] = useState(null);

    React.useEffect(() => {
        if (!editEntryId || !userId) {
            setEditEntry(null);
            setContent('');
            setSelectedPrompt(null);
            setShareWithPartner(false);
            return;
        }

        const loadEntry = async () => {
            try {
                const entry = await getJournalEntry(editEntryId);
                const id = journalEntryId(entry);
                const entryUser =
                    entry?.user_id ?? entry?.UserId ?? entry?.userId;
                if (!id || String(entryUser) !== String(userId)) {
                    setEditEntry(null);
                    return;
                }
                setEditEntry(entry);
                setContent(entry.content || '');
                setSelectedPrompt(entry.prompt || null);
                setShareWithPartner(
                    Boolean(entry.share_with_partner ?? entry.shareWithPartner),
                );
            } catch (e) {
                console.error('Error loading entry:', e);
                setEditEntry(null);
            }
        };
        loadEntry();
    }, [editEntryId, userId]);

    const handleSave = async () => {
        if (!content.trim() || !userId) return;
        setSaving(true);

        try {
            const id = journalEntryId(editEntry);
            if (editEntry && id) {
                await updateJournalEntry(id, {
                    content,
                    prompt: selectedPrompt,
                    share_with_partner: shareWithPartner,
                });
            } else {
                await createJournalEntry({
                    user_id: userId,
                    content,
                    prompt: selectedPrompt,
                    share_with_partner: shareWithPartner,
                });
            }
            setContent('');
            setSelectedPrompt(null);
            setShareWithPartner(false);
            setEditEntry(null);
            onEntryAdded?.();
            if (editEntryId) {
                window.history.back();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-xs font-medium text-[#5A4B70] mb-4 uppercase tracking-wide">
                {editEntry ? 'Edit Entry' : 'New Entry'}
            </p>

            <div className="mb-4">
                <p className="text-sm text-[#5A4B70] mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#9D8AA5]" />
                    Need inspiration?
                </p>
                <div className="flex flex-wrap gap-2">
                    {prompts.map((prompt) => (
                        <motion.button
                            key={prompt}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                                setSelectedPrompt(
                                    prompt === selectedPrompt ? null : prompt,
                                )
                            }
                            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                                selectedPrompt === prompt
                                    ? 'bg-[#7D6F99] text-white'
                                    : 'bg-[#E8E4F3] text-[#4A4458] hover:bg-[#DDD8EB] text-bold'
                            }`}
                        >
                            {prompt}
                        </motion.button>
                    ))}
                </div>
            </div>

            <Textarea
                placeholder={selectedPrompt || "What's on your heart today?"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="rounded-2xl border-[#E8DFF5] focus:border-[#9D8AA5] focus:ring-[#9D8AA5] resize-none min-h-[120px] mb-4"
            />

            <div className="flex items-center justify-between mb-4 p-3 bg-[#F5EEF8] rounded-xl">
                <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#9D8AA5]" />
                    <span className="text-sm text-[#4A4458]">Share with partner</span>
                </div>
                <Switch
                    checked={shareWithPartner}
                    onCheckedChange={setShareWithPartner}
                    className="data-[state=checked]:bg-[#9D8AA5]"
                />
            </div>

            {!userId && (
                <p className="text-sm text-[#7D7589] mb-3">
                    Sign in or complete onboarding so your journal can be saved to your profile.
                </p>
            )}

            <Button
                type="button"
                onClick={handleSave}
                disabled={!content.trim() || saving || !userId}
                className="w-full rounded-2xl bg-[#E8E4F3] hover:bg-[#DDD8EB] text-[#5A4B70] py-6"
            >
                {saving
                    ? editEntry
                        ? 'Updating...'
                        : 'Saving...'
                    : editEntry
                    ? 'Update Entry'
                    : 'Save Entry'}
            </Button>
        </div>
    );
}
