// @ts-nocheck
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listJournalEntries } from '@/api/journalEntryApi';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';
import NewEntryForm from '@/components/journal/NewEntryForm';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'react-router-dom';

export default function Journal() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const { userId, isResolvingUser } = useCurrentUserId();

    const { data: entries = [], isLoading } = useQuery({
        queryKey: ['journalEntries', userId],
        queryFn: () =>
            listJournalEntries({
                filter: { user_id: userId },
                sort: '-created_date',
                limit: 100,
            }),
        enabled: Boolean(userId),
    });

    const handleEntryAdded = () => {
        queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
        queryClient.invalidateQueries({ queryKey: ['journalEntriesCalendar'] });
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="mb-2">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="mb-4 text-[#5A4B70] hover:text-[#7A6A8E] transition-colors"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-semibold text-[#4A4458]">My Journal</h1>
                <p className="text-[#5A4B70] mt-1">A gentle space for your thoughts</p>
            </div>

            <NewEntryForm
                userId={userId}
                onEntryAdded={handleEntryAdded}
                editEntryId={editId}
            />

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9D8AA5]" />
                <label htmlFor="entry-search" className="sr-only">
                    Search entries
                </label>
                <Input
                    id="entry-search"
                    name="entry-search"
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl border-[#E8DFF5] focus:border-[#9D8AA5] focus:ring-[#9D8AA5]"
                />
            </div>

            <div>
                <p className="text-xs font-medium text-[#5A4B70] mb-4 uppercase tracking-wide">
                    Past Entries
                </p>

                {isResolvingUser ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#9D8AA5]" />
                    </div>
                ) : !userId ? (
                    <div className="text-center py-12 bg-white rounded-2xl">
                        <p className="text-[#7D7589]">Sign in again to use your journal.</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#9D8AA5]" />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl">
                        <p className="text-[#7D7589]">Your journal is empty</p>
                        <p className="text-sm text-[#7D7589]">Start writing your first entry above</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entries
                            .filter(
                                (entry) =>
                                    (entry.content || '')
                                        .toLowerCase()
                                        .includes(searchQuery.toLowerCase()) ||
                                    (entry.prompt &&
                                        entry.prompt
                                            .toLowerCase()
                                            .includes(searchQuery.toLowerCase())),
                            )
                            .map((entry) => (
                                <JournalEntryCard key={entry.journal_entry_id ?? entry.id} entry={entry} />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
