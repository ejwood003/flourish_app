    import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { APP_NARROW_MAX_WIDTH_CLASS } from '@/utils';
    import { useDocumentTitle } from '@/hooks/useDocumentTitle';
    import { ArrowLeft } from 'lucide-react';

    const meditationContent = {
    med1: "Take a deep breath in... and out. You are exactly where you need to be in this moment. Your presence here is enough.",
    med2: "As you feed your baby, breathe deeply. You are nourishing life. You are enough. This connection is beautiful.",
    med3: "Let your body sink into rest. You deserve this moment of peace. Sleep will come. You are safe.",
    med4: "Breathe in calm. Breathe out tension. You are releasing what no longer serves you. You are light.",
    med5: "This feeding time is sacred. You are giving your baby exactly what they need. You are doing beautifully.",
    med6: "As the day closes, let go of what you couldn't do. You showed up. You loved. That is everything.",
    med7: "In this brief moment, remember: you are strong, you are loved, and you are doing your best.",
    med8: "Deep rest is healing. Your body is recovering. Your mind is settling. You are exactly where you should be.",
    med9: "Together, you are navigating this journey. Your partnership is growing. You are both learning and loving.",
    };

    export default function MeditationPlayer() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const title = params.get('title');
    const duration = parseInt(params.get('duration')) || 5;

    useDocumentTitle(title || 'Meditation');

    const [elapsed, setElapsed] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

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

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const timeLeft = (duration * 60) - elapsed;
    const progress = (elapsed / (duration * 60)) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E8E4F3] via-[#D9EEF2] to-[#EDD9E8] flex flex-col">
        <div className="p-6">
            <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/30 hover:bg-white/50 transition-colors backdrop-blur-sm"
            aria-label="Back to previous screen"
            >
            <ArrowLeft className="w-5 h-5 text-[#4A4458]" aria-hidden />
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

            <h1 className="text-2xl font-semibold text-[#4A4458] mb-4 text-center">
            {title}
            </h1>

            <p className={`text-center text-[#4A4458] leading-relaxed ${APP_NARROW_MAX_WIDTH_CLASS} mb-8 px-4`}>
            {meditationContent[id] || "Breathe deeply. You are present. You are enough."}
            </p>

            <div className={`${APP_NARROW_MAX_WIDTH_CLASS} px-8`}>
            <div className="mb-4">
                <div
                className="w-full h-2 bg-white/30 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                aria-label="Meditation progress"
                >
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
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="mt-8 px-8 py-3 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-2xl text-[#4A4458] font-medium transition-colors"
            aria-pressed={isPlaying}
            >
            {isPlaying ? 'Pause' : 'Resume'}
            </button>
        </div>
        </div>
    );
    }