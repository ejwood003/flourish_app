import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listBabyActivities } from '@/api/babyActivityApi';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';
import QuickAddSection from '@/components/baby/QuickAddSection';
import HistorySection from '@/components/baby/HistorySection';
import { Loader2 } from 'lucide-react';
import UpcomingTasks from '@/components/home/UpcomingTasks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function Baby() {
    useDocumentTitle('Baby');
    const queryClient = useQueryClient();
    const [editingActivity, setEditingActivity] = useState(null);

    const { userId, isResolvingUser } = useCurrentUserId();

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['babyActivities', userId],
        queryFn: () =>
            listBabyActivities({
                filter: { user_id: userId },
                sort: '-timestamp',
                limit: 200,
            }),
        enabled: Boolean(userId),
    });

    const handleActivityAdded = () => {
        queryClient.invalidateQueries({ queryKey: ['babyActivities'] });
        queryClient.invalidateQueries({ queryKey: ['babyMoods'] });
        setEditingActivity(null);
    };

    const handleEditActivity = (activity) => {
        setEditingActivity(activity);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isResolvingUser) {
        return (
            <div className="space-y-6 pb-8">
                <div className="flex items-center justify-center py-20" aria-live="polite" aria-busy="true">
                    <Loader2 className="w-8 h-8 animate-spin text-[#8B7A9F]" aria-hidden />
                    <span className="sr-only">Loading baby dashboard</span>
                </div>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="space-y-6 pb-8">
                <p className="text-sm text-[#5A4B70] text-center py-12 bg-white rounded-3xl">
                    Sign in again to track baby activities.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#8B7A9F]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            <QuickAddSection
                userId={userId}
                onActivityAdded={handleActivityAdded}
                editingActivity={editingActivity}
                onCancelEdit={() => setEditingActivity(null)}
            />
            <UpcomingTasks />
            <HistorySection
                activities={activities}
                onEditActivity={handleEditActivity}
            />
        </div>
    );
}
