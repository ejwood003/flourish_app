    import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { createPageUrl } from '@/utils';
    import { Button } from '@/components/ui/button';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { base44 } from '@/api/base44Client';
    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    import { Loader2, Check } from 'lucide-react';
    import PersonalInfoSection from '@/components/profile/PersonalInfoSection';
    import NotificationsSettings from '@/components/profile/NotificationsSettings';
    import SharingSettings from '@/components/profile/SharingSettings';
    import HomeCustomization from '@/components/profile/HomeCustomization';

    export default function Profile() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState({});
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const { data: profiles = [] } = useQuery({
        queryKey: ['userProfiles'],
        queryFn: () => base44.entities.UserProfile.list(),
    });

    const profile = profiles[0];

    useEffect(() => {
        if (profile) {
        setProfileData(profile);
        }
    }, [profile]);

    const loadUser = async () => {
        try {
        const userData = await base44.auth.me();
        setUser(userData);
        } catch (e) {
        // Not logged in
        }
    };

    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
        if (profile?.id) {
            return await base44.entities.UserProfile.update(profile.id, data);
        } else {
            return await base44.entities.UserProfile.create(data);
        }
        },
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        },
    });

    const handleUpdate = (updates) => {
        setProfileData({ ...profileData, ...updates });
    };

    const handleSave = () => {
        updateProfileMutation.mutate(profileData);
    };

    return (
        <div className="space-y-6 pb-8">
        <div className="mb-6">
            <button
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
            />
            </TabsContent>

            <TabsContent value="settings" className="mt-6 space-y-6">
            <NotificationsSettings 
                profile={profileData}
                onUpdate={handleUpdate}
            />
            <SharingSettings 
                profile={profileData}
                onUpdate={handleUpdate}
            />
            <HomeCustomization 
                profile={profileData}
                onUpdate={handleUpdate}
            />
            </TabsContent>
        </Tabs>

        <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className={`w-full py-6 rounded-2xl font-medium text-white transition-all ${
            saved
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-[#5A4B70] hover:bg-[#5A4B70]'
            }`}
        >
            {saved ? (
            <>
                <Check className="w-5 h-5 mr-2" />
                Saved Successfully
            </>
            ) : updateProfileMutation.isPending ? (
            <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
            </>
            ) : (
            'Save Changes'
            )}
        </Button>

        <Button
            onClick={() => navigate(createPageUrl('Onboarding'))}
            variant="outline"
            className="w-full py-6 rounded-2xl font-medium border-[#E8E4F3] text-[#5A4B70] hover:bg-[#F5EEF8]"
        >
            Preview Onboarding Process
        </Button>
        </div>
    );
    }