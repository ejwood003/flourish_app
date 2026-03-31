// Page that allows users to edit home screen (from Home screen (NOT profile))
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    listUserProfiles,
    updateUserProfile,
    createUserProfile,
    USER_PROFILES_QUERY_KEY,
} from '@/api/userProfileApi';
import { getUserId } from '@/lib/auth';
import { APP_SHELL_MAX_WIDTH_CLASS } from '@/utils';
import HomeCustomization from '@/components/profile/HomeCustomization';

export default function EditHome() {
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

    const handleSavePatch = (patch) => updateProfileMutation.mutateAsync(patch);

    return (
        <div className="min-h-screen bg-[#FEF9F5] p-6 pb-24">
            <div className={APP_SHELL_MAX_WIDTH_CLASS}>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-4 text-[#5A4B70] hover:text-[#8B7A9F]"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-semibold text-[#4A4458] mb-2">Customize Home</h1>
                <p className="text-[#5A4B70] mb-6">Choose what you want to see on your home screen.</p>
                <HomeCustomization
                    profile={profileData}
                    onSavePatch={handleSavePatch}
                    isSaving={updateProfileMutation.isPending}
                    defaultOpen
                />
            </div>
        </div>
    );
}
