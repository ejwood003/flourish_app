import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Share2, BookOpen, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';

export default function JournalEntryCard({ entry }) {
const navigate = useNavigate();
const queryClient = useQueryClient();
const [isExpanded, setIsExpanded] = useState(false);
const [showDeleteDialog, setShowDeleteDialog] = useState(false);

const handleDelete = async () => {
try {
    await base44.entities.JournalEntry.delete(entry.id);
    queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
} catch (error) {
    console.error('Error deleting journal entry:', error);
}
setShowDeleteDialog(false);
};

return (
<motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl shadow-sm overflow-hidden"
>
    <button
    onClick={() => setIsExpanded(!isExpanded)}
    className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#F5EEF8]/30 transition-colors"
    >
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8DFF5] to-[#F2D7D9] flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-[#9D8AA5]" />
        </div>
        <div className="text-left">
        <p className="font-medium text-[#4A4458]">
            {format(new Date(entry.created_date), 'EEEE, MMM d')}
        </p>
        <p className="text-xs text-[#7D7589]">
            {format(new Date(entry.created_date), 'h:mm a')}
            {entry.share_with_partner && (
            <span className="ml-2 inline-flex items-center gap-1 text-[#9D8AA5]">
                <Share2 className="w-3 h-3" /> Shared
            </span>
            )}
        </p>
        </div>
    </div>
    <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
    >
        <ChevronDown className="w-5 h-5 text-[#9D8AA5]" />
    </motion.div>
    </button>

    <AnimatePresence>
    {isExpanded && (
        <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
        >
        <div className="px-5 pb-4 pt-0">
            {entry.prompt && (
            <p className="text-sm text-[#9D8AA5] italic mb-2">"{entry.prompt}"</p>
            )}
            <p className="text-[#4A4458] leading-relaxed whitespace-pre-wrap mb-3">
            {entry.content}
            </p>
            <div className="flex items-center gap-3">
            <button
                onClick={(e) => {
                e.stopPropagation();
                navigate(createPageUrl('Journal') + `?edit=${entry.id}`);
                }}
                className="flex items-center gap-2 text-sm text-[#9D8AA5] hover:text-[#8A7792] transition-colors"
            >
                <Edit className="w-4 h-4" />
                Edit
            </button>
            <button
                onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
                }}
                className="flex items-center gap-2 text-sm text-[#8B4A4A] hover:text-[#7A4040] transition-colors"
            >
                <Trash2 className="w-4 h-4" />
                Delete
            </button>
            </div>
        </div>
        </motion.div>
    )}
    </AnimatePresence>
</motion.div>
);
}