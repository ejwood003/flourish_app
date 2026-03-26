import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    listUserProfiles,
    updateUserProfile,
    createUserProfile,
    USER_PROFILES_QUERY_KEY,
} from '@/api/userProfileApi';
import { postLogout } from '@/api/authApi';
import { clearAuth, getUserId } from '@/lib/auth';
import PersonalInfoSection from '@/components/profile/PersonalInfoSection';
import NotificationsSettings from '@/components/profile/NotificationsSettings';
import SharingSettings from '@/components/profile/SharingSettings';
import HomeCustomization from '@/components/profile/HomeCustomization';
import ProfileHeader from '@/components/profile/ProfileHeader';

export default function Profile() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const uid = getUserId();
    const [profileData, setProfileData] = useState({});

    const { data: profiles = [] } = useQuery({
        queryKey: [...USER_PROFILES_QUERY_KEY, 'mine', uid],
        queryFn: () =>
            listUserProfiles({
                filter: { user_id: uid },
                limit: 5,
            }),
        enabled: Boolean(uid),
    });

    const profile = profiles[0];

    useEffect(() => {
        if (profile) {
            setProfileData(profile);
        }
    }, [profile]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const id = profile?.user_id ?? profile?.userId ?? profile?.id;
            if (id) {
                return updateUserProfile(id, data);
            }
            return createUserProfile(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_PROFILES_QUERY_KEY });
        },
    });

    const handlePersonalSavePatch = (patch) => updateProfileMutation.mutateAsync(patch);

    const handleSignOut = async () => {
        try {
            await postLogout();
        } catch {
            /* cookie may already be invalid; still clear client state */
        }
        clearAuth();
        queryClient.clear();
        navigate('/Welcome', { replace: true });
    };

    return (
        <div className="space-y-6 pb-8">
            <ProfileHeader profile={profileData} />

            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="flex h-auto w-full gap-2 p-1 bg-[#E8E4F3]/50 rounded-2xl">
                    <TabsTrigger
                        value="personal"
                        className="flex-1 rounded-xl py-2.5 text-sm font-medium text-[#5A4B70] transition-all data-[state=active]:bg-white data-[state=active]:text-[#4A4458] data-[state=active]:shadow-sm data-[state=inactive]:shadow-none"
                    >
                        Personal Info
                    </TabsTrigger>
                    <TabsTrigger
                        value="settings"
                        className="flex-1 rounded-xl py-2.5 text-sm font-medium text-[#5A4B70] transition-all data-[state=active]:bg-white data-[state=active]:text-[#4A4458] data-[state=active]:shadow-sm data-[state=inactive]:shadow-none"
                    >
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-6">
                    <PersonalInfoSection
                        profile={profileData}
                        onSavePatch={handlePersonalSavePatch}
                        isSaving={updateProfileMutation.isPending}
                    />
                </TabsContent>

                <TabsContent value="settings" className="mt-6 space-y-6">
                    <NotificationsSettings
                        profile={profileData}
                        onSavePatch={handlePersonalSavePatch}
                        isSaving={updateProfileMutation.isPending}
                    />
                    <SharingSettings
                        profile={profileData}
                        onSavePatch={handlePersonalSavePatch}
                        isSaving={updateProfileMutation.isPending}
                    />
                    <HomeCustomization
                        profile={profileData}
                        onSavePatch={handlePersonalSavePatch}
                        isSaving={updateProfileMutation.isPending}
                    />

                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm text-[#8B4A4A] hover:bg-[#F5E6EA] transition-colors font-medium text-sm"
                    >
                        Sign Out
                    </button>
                </TabsContent>
            </Tabs>
        </div>
    );
}
