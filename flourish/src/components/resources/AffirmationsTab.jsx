import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Search, ThumbsUp, ThumbsDown, Plus, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';

const defaultAffirmations = [
{ id: 1, text: "I am exactly who my baby needs.", is_default: true },
{ id: 2, text: "Rest is productive right now.", is_default: true },
{ id: 3, text: "I can be grateful and overwhelmed at the same time.", is_default: true },
{ id: 4, text: "Asking for help is strength.", is_default: true },
{ id: 5, text: "My best is enough today.", is_default: true },
{ id: 6, text: "I am learning alongside my baby.", is_default: true },
{ id: 7, text: "This moment will pass, and I will be okay.", is_default: true },
{ id: 8, text: "I deserve rest and care too.", is_default: true },
];

export default function AffirmationsTab() {
const [searchQuery, setSearchQuery] = useState('');
const [showAddForm, setShowAddForm] = useState(false);
const [newAffirmation, setNewAffirmation] = useState('');
const [reactions, setReactions] = useState({});
const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
const [editingId, setEditingId] = useState(null);
const [editText, setEditText] = useState('');
const queryClient = useQueryClient();

const { data: customAffirmations = [] } = useQuery({
queryKey: ['customAffirmations'],
queryFn: () => base44.entities.CustomAffirmation.list('-created_date', 100),
});

const { data: affirmationReactions = [] } = useQuery({
queryKey: ['affirmationReactions'],
queryFn: () => base44.entities.AffirmationReaction.list('-created_date', 200),
});

const allAffirmations = [
...defaultAffirmations,
...customAffirmations.map(a => ({ ...a, is_default: false }))
];

const filteredAffirmations = allAffirmations.filter(a => {
const matchesSearch = a.text.toLowerCase().includes(searchQuery.toLowerCase());
const key = `${a.is_default ? 'default' : 'custom'}_${a.id}`;
const hasFavoriteReaction = reactions[key] === 'up';
const matchesFavorites = !showFavoritesOnly || hasFavoriteReaction;
return matchesSearch && matchesFavorites;
});

const handleAddAffirmation = async () => {
if (!newAffirmation.trim()) return;
await base44.entities.CustomAffirmation.create({ text: newAffirmation });
queryClient.invalidateQueries({ queryKey: ['customAffirmations'] });
setNewAffirmation('');
setShowAddForm(false);
};

const handleReaction = async (affirmation, type) => {
const key = `${affirmation.is_default ? 'default' : 'custom'}_${affirmation.id}`;
setReactions(prev => ({ ...prev, [key]: type }));

if (!affirmation.is_default) {
    await base44.entities.AffirmationReaction.create({
    affirmation_id: affirmation.id,
    reaction: type,
    });
    queryClient.invalidateQueries({ queryKey: ['affirmationReactions'] });
}
};

const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

const handleDelete = async () => {
try {
    await base44.entities.CustomAffirmation.delete(deleteDialog.id);
    queryClient.invalidateQueries({ queryKey: ['customAffirmations'] });
} catch (error) {
    console.error('Error deleting affirmation:', error);
}
setDeleteDialog({ open: false, id: null });
};

const handleEdit = (affirmation) => {
setEditingId(affirmation.id);
setEditText(affirmation.text);
};

const handleSaveEdit = async () => {
if (!editText.trim()) return;
await base44.entities.CustomAffirmation.update(editingId, { text: editText });
queryClient.invalidateQueries({ queryKey: ['customAffirmations'] });
setEditingId(null);
setEditText('');
};

return (
<div className="space-y-6">
    <div className="flex gap-3">
    <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7A9F]" />
        <label htmlFor="affirmation-search" className="sr-only">Search affirmations</label>
        <Input
            id="affirmation-search"
            name="affirmation-search"
            placeholder="Search affirmations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F] focus:ring-[#8B7A9F]"
        />
    </div>
    <Button
        onClick={() => setShowAddForm(!showAddForm)}
        className="bg-[#8B7A9F] hover:bg-[#7A6B8D] text-white rounded-xl px-4"
    >
        <Plus className="w-4 h-4" />
    </Button>
    </div>

    <button
    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
    className={`w-full py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
        showFavoritesOnly
        ? 'bg-[#8B7A9F] text-white'
        : 'bg-[#E8E4F3] text-[#5A4B70]'
    }`}
    >
    <ThumbsUp className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
    Favorites
    </button>

    <AnimatePresence>
    {showAddForm && (
        <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-white rounded-2xl p-4 shadow-sm overflow-hidden"
        >
        <label htmlFor="new-affirmation" className="sr-only">Write your own affirmation</label>
        <Textarea
            id="new-affirmation"
            name="new-affirmation"
            placeholder="Write your own affirmation..."
            value={newAffirmation}
            onChange={(e) => setNewAffirmation(e.target.value)}
            className="rounded-xl border-[#E8E4F3] mb-3"
            rows={3}
        />
        <div className="flex gap-2">
            <Button
            variant="outline"
            onClick={() => setShowAddForm(false)}
            className="flex-1 rounded-xl"
            >
            Cancel
            </Button>
            <Button
            onClick={handleAddAffirmation}
            className="flex-1 rounded-xl bg-[#8B7A9F] hover:bg-[#7A6B8D] text-white"
            >
            Add
            </Button>
        </div>
        </motion.div>
    )}
    </AnimatePresence>

    <div className="space-y-3">
    {filteredAffirmations.map((affirmation) => {
        const key = `${affirmation.is_default ? 'default' : 'custom'}_${affirmation.id}`;
        const reaction = reactions[key];
        const isEditing = editingId === affirmation.id;
        return (
        <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm"
        >
            {isEditing ? (
            <div className="space-y-3">
               <label htmlFor="edit-affirmation" className="sr-only">Edit affirmation</label>
                <Textarea
                    id="edit-affirmation"
                    name="edit-affirmation"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="rounded-xl border-[#E8E4F3]"
                    rows={2}
                />
                <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={() => setEditingId(null)}
                    className="flex-1 rounded-xl"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSaveEdit}
                    className="flex-1 rounded-xl bg-[#8B7A9F] hover:bg-[#7A6B8D] text-white"
                >
                    Save
                </Button>
                </div>
            </div>
            ) : (
            <>
                <p className="text-[#4A4458] mb-3 leading-relaxed">{affirmation.text}</p>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(affirmation, 'up')}
                    className={`p-2 rounded-xl transition-all ${
                        reaction === 'up'
                        ? 'bg-[#8B7A9F] text-white'
                        : 'bg-[#E8E4F3] text-[#8B7A9F] hover:bg-[#DDD8EB]'
                    }`}
                    >
                    <ThumbsUp className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(affirmation, 'down')}
                    className={`p-2 rounded-xl transition-all ${
                        reaction === 'down'
                        ? 'bg-[#EDD9E8] text-[#8B7A9F]'
                        : 'bg-[#E8E4F3] text-[#8B7A9F] hover:bg-[#DDD8EB]'
                    }`}
                    >
                    <ThumbsDown className="w-4 h-4" />
                    </motion.button>
                </div>
                {!affirmation.is_default && (
                    <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(affirmation)}
                        className="p-2 rounded-xl bg-[#E8E4F3] text-[#8B7A9F] hover:bg-[#DDD8EB] transition-all"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setDeleteDialog({ open: true, id: affirmation.id })}
                        className="p-2 rounded-xl bg-[#F5E6EA] text-[#8B4A4A] hover:bg-[#F0DAE0] transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </div>
                )}
                </div>
            </>
            )}
        </motion.div>
        );
    })}
    </div>

    <DeleteConfirmationDialog
    open={deleteDialog.open}
    onOpenChange={(open) => setDeleteDialog({ open, id: null })}
    onConfirm={handleDelete}
    title="Delete affirmation?"
    description="This action cannot be undone."
    />
</div>
);
}