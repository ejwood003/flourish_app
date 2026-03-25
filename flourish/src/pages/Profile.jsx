import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    listUserProfiles,
    updateUserProfile,
    createUserProfile,
    USER_PROFILES_QUERY_KEY,
} from '@/api/userProfileApi';
import { fetchSession, postLogout } from '@/api/authApi';
import { clearAuth, getUserId } from '@/lib/auth';
import PersonalInfoSection from '@/components/profile/PersonalInfoSection';
import NotificationsSettings from '@/components/profile/NotificationsSettings';
import SharingSettings from '@/components/profile/SharingSettings';
import HomeCustomization from '@/components/profile/HomeCustomization';

export default function Profile() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const uid = getUserId();
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState({});
    const [personalSaveSuccess, setPersonalSaveSuccess] = useState(false);
    const personalSaveRef = useRef(false);
    const profileDataRef = useRef({});

    useEffect(() => {
        profileDataRef.current = profileData;
    }, [profileData]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const s = await fetchSession();
            if (!cancelled && s) {
                setUser({
                    id: s.user_id ?? s.userId,
                    user_type: s.user_type ?? s.userType,
                });
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

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
            if (personalSaveRef.current) {
                setPersonalSaveSuccess(true);
                setTimeout(() => setPersonalSaveSuccess(false), 2000);
                personalSaveRef.current = false;
            }
        },
        onError: () => {
            personalSaveRef.current = false;
        },
    });

    const handleUpdate = (updates) => {
        setProfileData((prev) => ({ ...prev, ...updates }));
    };

    const handleSettingsPersist = (updates) => {
        setProfileData((prev) => ({ ...prev, ...updates }));
        updateProfileMutation.mutate(updates);
    };

    const handlePersonalSave = () => {
        personalSaveRef.current = true;
        updateProfileMutation.mutate(profileDataRef.current);
    };

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
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="mb-4 text-[#5A4B70] hover:text-[#5A4B70] transition-colors"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-semibold text-[#4A4458]">Profile</h1>
                <p className="text-[#5A4B70] mt-1">Manage your information and settings</p>
            </div>

            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white rounded-2xl p-1 shadow-sm">
                    <TabsTrigger
                        value="personal"
                        className="rounded-xl data-[state=active]:bg-[#E8E4F3] data-[state=active]:text-[#5A4B70]"
                    >
                        Personal Info
                    </TabsTrigger>
                    <TabsTrigger
                        value="settings"
                        className="rounded-xl data-[state=active]:bg-[#E8E4F3] data-[state=active]:text-[#5A4B70]"
                    >
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-6">
                    <PersonalInfoSection
                        profile={profileData}
                        user={user}
                        onUpdate={handleUpdate}
                        onSave={handlePersonalSave}
                        isSaving={updateProfileMutation.isPending}
                        saveSuccess={personalSaveSuccess}
                    />
                </TabsContent>

                <TabsContent value="settings" className="mt-6 space-y-6">
                    <NotificationsSettings profile={profileData} onUpdate={handleSettingsPersist} />
                    <SharingSettings profile={profileData} onUpdate={handleSettingsPersist} />
                    <HomeCustomization profile={profileData} onUpdate={handleSettingsPersist} />
                </TabsContent>
            </Tabs>

            <Button
                type="button"
                onClick={() => navigate('/Welcome')}
                variant="outline"
                className="w-full py-6 rounded-2xl font-medium border-[#E8E4F3] text-[#5A4B70] hover:bg-[#F5EEF8]"
            >
                Back to welcome
            </Button>

            <Button
                type="button"
                onClick={handleSignOut}
                variant="outline"
                className="w-full py-6 rounded-2xl font-medium border-red-200 text-red-700 hover:bg-red-50"
            >
                Sign out
            </Button>
        </div>
    );
}
