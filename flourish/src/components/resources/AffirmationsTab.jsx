import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    listAffirmations,
    createAffirmation,
    updateAffirmation,
    deleteAffirmation,
} from '@/api/affirmationApi';
import {
    createAffirmationReaction,
    deleteAffirmationReaction,
    listAffirmationReactions,
    updateAffirmationReaction,
} from '@/api/affirmationReactionApi';
import { getUserId } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Search, ThumbsUp, ThumbsDown, Plus, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';

function affirmationId(affirmation) {
    return affirmation.affirmation_id ?? affirmation.affirmationId ?? affirmation.id;
}

function reactionRowId(row) {
    return row.affirmation_reaction_id ?? row.affirmationReactionId ?? row.id;
}

export default function AffirmationsTab() {
const [searchQuery, setSearchQuery] = useState('');
const [showAddForm, setShowAddForm] = useState(false);
const [newAffirmation, setNewAffirmation] = useState('');
const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
const [editingId, setEditingId] = useState(null);
const [editText, setEditText] = useState('');
const queryClient = useQueryClient();
const userId = getUserId();

const { data: affirmationsFromDb = [] } = useQuery({
queryKey: ['affirmations'],
queryFn: () => listAffirmations({ limit: 200 }),
});

const { data: reactionRows = [] } = useQuery({
queryKey: ['affirmationReactions', userId],
queryFn: () =>
    listAffirmationReactions({
    filter: { user_id: userId },
    }),
enabled: Boolean(userId),
});

const reactionMap = reactionRows.reduce((acc, row) => {
    const aid = row.affirmation_id ?? row.affirmationId;
    if (!aid) return acc;
    // Keep the first one we see for each affirmation (good enough for a simple UI).
    if (!acc[aid]) acc[aid] = row;
    return acc;
}, {});

const filteredAffirmations = affirmationsFromDb.filter(a => {
const matchesSearch = a.text.toLowerCase().includes(searchQuery.toLowerCase());
const existing = reactionMap[affirmationId(a)];
const hasFavoriteReaction = existing?.reaction === 'up';
const matchesFavorites = !showFavoritesOnly || hasFavoriteReaction;
return matchesSearch && matchesFavorites;
});

const handleAddAffirmation = async () => {
if (!newAffirmation.trim()) return;
await createAffirmation({ text: newAffirmation });
queryClient.invalidateQueries({ queryKey: ['affirmations'] });
setNewAffirmation('');
setShowAddForm(false);
};

const handleReaction = async (affirmation, type) => {
    if (!userId) return;
    const affId = affirmationId(affirmation);
    const existing = reactionMap[affId];

    if (existing) {
        // Toggle off if clicking the same reaction again
        if (existing.reaction === type) {
            await deleteAffirmationReaction(reactionRowId(existing));
        } else {
            await updateAffirmationReaction(reactionRowId(existing), { reaction: type });
        }
    } else {
        await createAffirmationReaction({
            affirmation_id: affId,
            reaction: type,
            user_id: userId,
        });
    }

    await queryClient.invalidateQueries({ queryKey: ['affirmationReactions', userId] });
};

const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

const handleDelete = async () => {
try {
    await deleteAffirmation(deleteDialog.id);
    queryClient.invalidateQueries({ queryKey: ['affirmations'] });
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
await updateAffirmation(editingId, { text: editText });
queryClient.invalidateQueries({ queryKey: ['affirmations'] });
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
        type="button"
        onClick={() => setShowAddForm(!showAddForm)}
        className="bg-[#8B7A9F] hover:bg-[#7A6B8D] text-white rounded-xl px-4"
        aria-expanded={showAddForm}
        aria-label={showAddForm ? 'Close add affirmation form' : 'Add affirmation'}
    >
        <Plus className="w-4 h-4" aria-hidden />
    </Button>
    </div>

    <button
    type="button"
    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
    className={`w-full py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
        showFavoritesOnly
        ? 'bg-[#8B7A9F] text-white'
        : 'bg-[#E8E4F3] text-[#5A4B70]'
    }`}
    aria-pressed={showFavoritesOnly}
    >
    <ThumbsUp className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} aria-hidden />
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
        const key = affirmationId(affirmation);
        const reaction = reactionMap[key]?.reaction;
        const isEditing = editingId === key;
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
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(affirmation, 'up')}
                    className={`p-2 rounded-xl transition-all ${
                        reaction === 'up'
                        ? 'bg-[#8B7A9F] text-white'
                        : 'bg-[#E8E4F3] text-[#8B7A9F] hover:bg-[#DDD8EB]'
                    }`}
                    aria-label="Like affirmation"
                    aria-pressed={reaction === 'up'}
                    >
                    <ThumbsUp className="w-4 h-4" aria-hidden />
                    </motion.button>
                    <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(affirmation, 'down')}
                    className={`p-2 rounded-xl transition-all ${
                        reaction === 'down'
                        ? 'bg-[#EDD9E8] text-[#8B7A9F]'
                        : 'bg-[#E8E4F3] text-[#8B7A9F] hover:bg-[#DDD8EB]'
                    }`}
                    aria-label="Dislike affirmation"
                    aria-pressed={reaction === 'down'}
                    >
                    <ThumbsDown className="w-4 h-4" aria-hidden />
                    </motion.button>
                </div>
                <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => handleEdit({ ...affirmation, id: key })}
                    className="p-2 rounded-xl bg-[#E8E4F3] text-[#8B7A9F] hover:bg-[#DDD8EB] transition-all"
                    aria-label="Edit affirmation"
                >
                    <Edit className="w-4 h-4" aria-hidden />
                </button>
                <button
                    type="button"
                    onClick={() => setDeleteDialog({ open: true, id: key })}
                    className="p-2 rounded-xl bg-[#F5E6EA] text-[#8B4A4A] hover:bg-[#F0DAE0] transition-all"
                    aria-label="Delete affirmation"
                >
                    <Trash2 className="w-4 h-4" aria-hidden />
                </button>
                </div>
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