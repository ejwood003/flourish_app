// @ts-nocheck
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listJournalEntries } from '@/api/journalEntryApi';
import { listUserProfiles, USER_PROFILES_QUERY_KEY } from '@/api/userProfileApi';
import { pickPrimaryUserProfile } from '@/lib/devUser';
import { journalEntryCreatedAt, journalEntryId } from '@/lib/journalEntryFields';
import { ArrowLeft, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

export default function PartnerJournalView() {
    const [searchQuery, setSearchQuery] = useState('');

    const { data: profiles = [] } = useQuery({
        queryKey: USER_PROFILES_QUERY_KEY,
        queryFn: () => listUserProfiles(),
    });
    const profile = pickPrimaryUserProfile(profiles);
    const userId = profile?.user_id ?? profile?.userId;

    const { data: journals = [] } = useQuery({
        queryKey: ['partnerJournals', userId],
        queryFn: () =>
            listJournalEntries({
                filter: { user_id: userId, share_with_partner: true },
                sort: '-created_date',
                limit: 100,
            }),
        enabled: Boolean(userId),
    });

    if (!userId) {
        return (
            <div className="min-h-screen bg-[#FEF9F5] p-6">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="mb-4 text-[#8B7A9F] hover:text-[#7A6A8E] transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>
                <div className="text-center py-12">
                    <p className="text-[#7D7589]">No profile found</p>
                </div>
            </div>
        );
    }

    const filteredJournals = journals.filter(
        (j) =>
            (j.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (j.prompt && j.prompt.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    const groupedByDate = filteredJournals.reduce((acc, entry) => {
        const created = journalEntryCreatedAt(entry);
        if (!created) return acc;
        const date = format(created, 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-[#FEF9F5] pb-8">
            <div className="max-w-lg mx-auto px-4 pt-6">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="mb-4 text-[#8B7A9F] hover:text-[#7A6A8E] transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-[#4A4458]">Journal Entries</h1>
                    <p className="text-[#7D7589] mt-1">Entries shared with partner</p>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7A9F]" />
                    <label htmlFor="journal-search" className="sr-only">
                        Search journals
                    </label>
                    <Input
                        id="journal-search"
                        name="journal-search"
                        placeholder="Search journals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F] focus:ring-[#8B7A9F]"
                    />
                </div>

                <div className="space-y-6">
                    {Object.keys(groupedByDate).length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-[#7D7589]">No shared journal entries</p>
                        </div>
                    ) : (
                        Object.keys(groupedByDate)
                            .sort((a, b) => new Date(b) - new Date(a))
                            .map((date) => (
                                <div key={date}>
                                    <div className="sticky top-0 bg-[#FEF9F5] py-2 mb-3">
                                        <h2 className="text-lg font-semibold text-[#4A4458]">
                                            {format(new Date(date), 'MMMM d, yyyy')}
                                        </h2>
                                    </div>
                                    <div className="space-y-3">
                                        {groupedByDate[date].map((entry) => {
                                            const created = journalEntryCreatedAt(entry);
                                            return (
                                                <div
                                                    key={journalEntryId(entry)}
                                                    className="bg-white rounded-2xl p-5 shadow-sm"
                                                >
                                                    {entry.prompt && (
                                                        <p className="text-sm font-medium text-[#8B7A9F] mb-3">
                                                            {entry.prompt}
                                                        </p>
                                                    )}
                                                    <p className="text-[#4A4458] leading-relaxed whitespace-pre-wrap">
                                                        {entry.content}
                                                    </p>
                                                    <p className="text-xs text-[#7D7589] mt-3">
                                                        {created ? format(created, 'h:mm a') : ''}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
}
