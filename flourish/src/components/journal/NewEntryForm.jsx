import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const prompts = [
"What small moment do I want to remember?",
"What do I need more of right now?",
"What am I looking forward to?",
"What made me smile today?",
"What am I proud of myself for?",
];

export default function NewEntryForm({ onEntryAdded, editEntryId }) {
const [content, setContent] = useState('');
const [selectedPrompt, setSelectedPrompt] = useState(null);
const [shareWithPartner, setShareWithPartner] = useState(false);
const [saving, setSaving] = useState(false);
const [editEntry, setEditEntry] = useState(null);

// Load entry if editing
React.useEffect(() => {
if (editEntryId) {
    const loadEntry = async () => {
    try {
        const entries = await base44.entities.JournalEntry.list();
        const entry = entries.find(e => e.id === editEntryId);
        if (entry) {
        setEditEntry(entry);
        setContent(entry.content || '');
        setSelectedPrompt(entry.prompt || null);
        setShareWithPartner(entry.share_with_partner || false);
        }
    } catch (e) {
        console.error('Error loading entry:', e);
    }
    };
    loadEntry();
} else {
    // Reset form when not editing
    setEditEntry(null);
    setContent('');
    setSelectedPrompt(null);
    setShareWithPartner(false);
}
}, [editEntryId]);

const handleSave = async () => {
if (!content.trim()) return;
setSaving(true);

try {
    if (editEntry) {
    await base44.entities.JournalEntry.update(editEntry.id, {
        content,
        prompt: selectedPrompt,
        share_with_partner: shareWithPartner,
    });
    } else {
    await base44.entities.JournalEntry.create({
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
    <p className="text-xs font-medium text-[#9D8AA5] mb-4 uppercase tracking-wide">
    {editEntry ? 'Edit Entry' : 'New Entry'}
    </p>

    {/* Prompt Suggestions */}
    <div className="mb-4">
    <p className="text-sm text-[#7D7589] mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#9D8AA5]" />
        Need inspiration?
    </p>
    <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
        <motion.button
            key={prompt}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPrompt(prompt === selectedPrompt ? null : prompt)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
            selectedPrompt === prompt
                ? 'bg-[#9D8AA5] text-white'
                : 'bg-[#F5EEF8] text-[#7D7589] hover:bg-[#E8DFF5]'
            }`}
        >
            {prompt}
        </motion.button>
        ))}
    </div>
    </div>

    {/* Text Area */}
    <label htmlFor="journal-entry" className="sr-only">Journal entry</label>
    <Textarea
        id="journal-entry"
        name="journal-entry"
        placeholder={selectedPrompt || "What's on your heart today?"}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="rounded-2xl border-[#E8DFF5] focus:border-[#9D8AA5] focus:ring-[#9D8AA5] resize-none min-h-[120px] mb-4"
    />

    {/* Share Toggle */}
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

    {/* Save Button */}
    <Button
    onClick={handleSave}
    disabled={!content.trim() || saving}
    className="w-full rounded-2xl bg-[#9D8AA5] hover:bg-[#8A7792] text-white py-6"
    >
    {saving ? (editEntry ? 'Updating...' : 'Saving...') : (editEntry ? 'Update Entry' : 'Save Entry')}
    </Button>
</div>
);
}