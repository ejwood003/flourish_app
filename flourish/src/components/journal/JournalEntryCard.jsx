import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Share2, BookOpen, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { deleteJournalEntry } from '@/api/journalEntryApi';
import { useQueryClient } from '@tanstack/react-query';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';
import { journalEntryCreatedAt, journalEntryId } from '@/lib/journalEntryFields';

export default function JournalEntryCard({ entry }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const id = journalEntryId(entry);
    const createdAt = journalEntryCreatedAt(entry);
    const shareWithPartner = Boolean(
        entry.share_with_partner ?? entry.shareWithPartner,
    );

    const handleDelete = async () => {
        if (!id) return;
        try {
            await deleteJournalEntry(id);
            queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
            queryClient.invalidateQueries({ queryKey: ['journalEntriesCalendar'] });
        } catch (error) {
            console.error('Error deleting journal entry:', error);
        }
        setShowDeleteDialog(false);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#F5EEF8]/30 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8DFF5] to-[#F2D7D9] flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-[#9D8AA5]" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-[#595959]">
                                {createdAt
                                    ? format(createdAt, 'EEEE, MMM d')
                                    : '—'}
                            </p>
                            <p className="text-xs text-[#595959]">
                                {createdAt ? format(createdAt, 'h:mm a') : ''}
                                {shareWithPartner && (
                                    <span className="ml-2 inline-flex items-center gap-1 text-[#595959]">
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
                                    <p className="text-sm text-[#595959] italic mb-2">
                                        &quot;{entry.prompt}&quot;
                                    </p>
                                )}
                                <p className="text-[#4A4458] leading-relaxed whitespace-pre-wrap mb-3">
                                    {entry.content}
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(
                                                `${createPageUrl('Journal')}?edit=${id}`,
                                            );
                                        }}
                                        className="flex items-center gap-2 text-sm text-[#595959] hover:text-[#8A7792] transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteDialog(true);
                                        }}
                                        className="flex items-center gap-2 text-sm text-[#5A4B70] hover:text-[#4A4458] transition-colors"
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

            <DeleteConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                title="Delete this journal entry?"
                description="This will permanently remove this entry. This action cannot be undone."
            />
        </>
    );
}
