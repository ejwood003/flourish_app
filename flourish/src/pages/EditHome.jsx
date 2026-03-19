// Page that allows users to edit home screen (from Home screen (NOT profile))
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HomeCustomization from '@/components/profile/HomeCustomization';

export default function EditHome() {
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
            {/* Header */}
            <div className="mb-2">
                <button
                onClick={() => window.history.back()}
                className="mb-4 text-[#5A4B70] hover:text-[#7A6A8E] transition-colors"
                >
                ← Back
                </button>
                <h1 className="text-2xl font-semibold text-[#4A4458]">Edit Home Screen</h1>
            </div>

            <HomeCustomization 
                profile={profileData}
                onUpdate={handleUpdate}
            />
        </div>
    );
}