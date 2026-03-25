    import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { createPageUrl } from '@/utils';
    import { useQuery, useQueryClient } from '@tanstack/react-query';
    import {
        listSavedResources,
        createSavedResource,
        deleteSavedResource,
    } from '@/api/savedResourceApi';
    import { getUserId } from '@/lib/auth';
    import { ArrowLeft, Star } from 'lucide-react';

    const meditationContent = {
    general: "Take a deep breath in... and out. You are exactly where you need to be in this moment. Your presence here is enough.",
    breastfeeding: "As you feed your baby, breathe deeply. You are nourishing life. You are enough. This connection is beautiful.",
    sleep: "Let your body sink into rest. You deserve this moment of peace. Sleep will come. You are safe.",
    };

    export default function LiveMeditation() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'general';
    const duration = parseInt(params.get('duration')) || 5;
    const fromTab = params.get('from');

    const [elapsed, setElapsed] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const uid = getUserId();
    const meditationId = `live_${type}_${duration}`;

    const { data: savedResources = [] } = useQuery({
        queryKey: ['savedMeditations', uid],
        queryFn: () =>
            listSavedResources({
                filter: { user_id: uid },
                limit: 200,
            }),
        enabled: Boolean(uid),
    });

    const savedRow = savedResources.find(
        (r) => r.resource_id === meditationId && r.resource_type === 'meditation',
    );
    const isStarred = Boolean(savedRow);

    useEffect(() => {
        if (!isPlaying) return;
        
        const interval = setInterval(() => {
        setElapsed(prev => {
            if (prev >= duration * 60) {
            setIsPlaying(false);
            return prev;
            }
            return prev + 1;
        });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, duration]);

    const handleToggleStar = async () => {
        if (!uid) return;
        if (savedRow) {
            const sid = savedRow.saved_resource_id ?? savedRow.SavedResourceId ?? savedRow.id;
            await deleteSavedResource(sid);
        } else {
            await createSavedResource({
                resource_id: meditationId,
                resource_type: 'meditation',
                user_id: uid,
            });
        }
        queryClient.invalidateQueries({ queryKey: ['savedMeditations', uid] });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const timeLeft = (duration * 60) - elapsed;
    const progress = (elapsed / (duration * 60)) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E8E4F3] via-[#D9EEF2] to-[#EDD9E8] flex flex-col">
        <div className="p-6 flex justify-between items-center">
            <button
            onClick={() => {
                if (fromTab === 'home') {
                navigate(createPageUrl('Home'));
                } else {
                navigate(createPageUrl('Resources') + (fromTab ? `?tab=${fromTab}` : ''));
                }
            }}
            className="p-2 rounded-xl bg-white/30 hover:bg-white/50 transition-colors backdrop-blur-sm"
            >
            <ArrowLeft className="w-5 h-5 text-[#4A4458]" />
            </button>
            
            <button
            onClick={handleToggleStar}
            className="p-2 rounded-xl bg-white/30 hover:bg-white/50 transition-colors backdrop-blur-sm"
            >
            <Star 
                className={`w-5 h-5 ${isStarred ? 'text-[#8B7A9F]' : 'text-[#4A4458]'}`}
                fill={isStarred ? 'currentColor' : 'none'}
            />
            </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md mb-8 flex items-center justify-center">
            <div 
                className="w-28 h-28 rounded-full bg-white/30"
                style={{
                transform: `scale(${1 + (Math.sin(elapsed * 0.5) * 0.1)})`,
                transition: 'transform 0.5s ease-in-out'
                }}
            />
            </div>

            <h1 className="text-2xl font-semibold text-[#4A4458] mb-4 text-center capitalize">
            {type} Meditation
            </h1>

            <p className="text-center text-[#4A4458] leading-relaxed max-w-md mb-8 px-4">
            {meditationContent[type]}
            </p>

            <div className="w-full max-w-md px-8">
            <div className="mb-4">
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[#8B7A9F] transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
                </div>
            </div>

            <div className="flex justify-between text-sm text-[#4A4458]">
                <span>{formatTime(elapsed)}</span>
                <span className="text-[#7D7589]">{formatTime(timeLeft)} remaining</span>
            </div>
            </div>

            <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="mt-8 px-8 py-3 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-2xl text-[#4A4458] font-medium transition-colors"
            >
            {isPlaying ? 'Pause' : 'Resume'}
            </button>
        </div>
        </div>
    );
    }