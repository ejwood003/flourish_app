    import React, { useState } from 'react';
    import { useQuery } from '@tanstack/react-query';
    import { base44 } from '@/api/base44Client';
    import { ArrowLeft, Home, Baby, Calendar, Library, Sparkles, Wind, Clock, ThumbsUp, FileText, Heart } from 'lucide-react';
    import { format } from 'date-fns';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { Link, useNavigate } from 'react-router-dom';
    import { createPageUrl } from '@/utils';
    import { AnimatePresence } from 'framer-motion';
    import BabyQuickActions from '@/components/home/BabyQuickActions';
    import MindfulnessHub from '@/components/home/MindfulnessHub';
    import GuidedBreathing from '@/components/home/GuidedBreathing';

    const getMoodColor = (value) => {
    if (value >= 75) return 'bg-[#D9EEF2]';
    if (value >= 50) return 'bg-[#E8E4F3]';
    if (value >= 25) return 'bg-[#EDD9E8]';
    return 'bg-[#F5E6EA]';
    };

    const getMoodLabel = (value) => {
    if (value >= 75) return 'Great';
    if (value >= 50) return 'Okay';
    if (value >= 25) return 'Struggling';
    return 'Very Difficult';
    };

    export default function PartnerHome() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messageSent, setMessageSent] = useState(false);
    const [showBreathing, setShowBreathing] = useState(false);

    const { data: moodEntries = [] } = useQuery({
        queryKey: ['moodEntries'],
        queryFn: () => base44.entities.MoodEntry.list('-created_date', 10),
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['babyActivities'],
        queryFn: () => base44.entities.BabyActivity.list('-timestamp', 50),
    });

    const { data: supportRequests = [] } = useQuery({
        queryKey: ['supportRequests'],
        queryFn: () => base44.entities.SupportRequest.list(),
    });

    const { data: journals = [] } = useQuery({
        queryKey: ['journals'],
        queryFn: () => base44.entities.JournalEntry.list('-created_date', 5),
    });

    const { data: profiles = [] } = useQuery({
        queryKey: ['userProfiles'],
        queryFn: () => base44.entities.UserProfile.list(),
    });

    const { data: selectedSupport = [] } = useQuery({
        queryKey: ['selectedSupport'],
        queryFn: () => base44.entities.SelectedSupportRequest.list('-selected_date', 10),
    });

    const profile = profiles[0];
    const todayMoods = moodEntries.filter(m => m.date === new Date().toISOString().split('T')[0]);
    const latestMood = todayMoods[0];
    const todaySupport = selectedSupport.filter(s => s.selected_date === new Date().toISOString().split('T')[0]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        
        const partnerName = profile?.support_name || 'Partner';
        await base44.entities.CustomAffirmation.create({
        text: `"${message}" — ${partnerName}`,
        is_favorite: false,
        });
        
        setMessage('');
        setMessageSent(true);
        setTimeout(() => setMessageSent(false), 3000);
    };

    const calculateNextFeeding = () => {
        const feedings = activities
        .filter(a => ['breastfeed', 'bottle'].includes(a.type))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

        if (feedings.length < 2) return null;
        
        let totalMinutes = 0;
        for (let i = 0; i < feedings.length - 1; i++) {
        const diff = Math.abs(new Date(feedings[i].timestamp) - new Date(feedings[i + 1].timestamp)) / 60000;
        totalMinutes += diff;
        }
        const avgMinutes = Math.round(totalMinutes / (feedings.length - 1));
        
        if (feedings[0]) {
        return new Date(new Date(feedings[0].timestamp).getTime() + avgMinutes * 60000);
        }
        return null;
    };

    const calculateNextNap = () => {
        const naps = activities
        .filter(a => a.type === 'nap')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

        if (naps.length < 2) return null;
        
        let totalMinutes = 0;
        for (let i = 0; i < naps.length - 1; i++) {
        const diff = Math.abs(new Date(naps[i].timestamp) - new Date(naps[i + 1].timestamp)) / 60000;
        totalMinutes += diff;
        }
        const avgMinutes = Math.round(totalMinutes / (naps.length - 1));
        
        if (naps[0]) {
        return new Date(new Date(naps[0].timestamp).getTime() + avgMinutes * 60000);
        }
        return null;
    };

    const nextFeeding = calculateNextFeeding();
    const nextNap = calculateNextNap();

    const navItems = [
        { name: 'Home', icon: Home },
        { name: 'Baby', icon: Baby },
        { name: 'Calendar', icon: Calendar },
        { name: 'Resources', icon: Library },
    ];

    const articles = [
        { id: 1, title: 'Supporting Your Partner Postpartum', description: 'Key ways to be present and helpful', tag: 'For Partners' },
        { id: 2, title: 'Understanding Postpartum Emotions', description: 'What to know and how to help', tag: 'For Partners' },
    ];

    return (
        <div className="min-h-screen bg-[#FEF9F5] pb-24">
        <div className="max-w-lg mx-auto px-4 pt-6">
            <button
            onClick={() => window.history.back()}
            className="mb-4 text-[#8B7A9F] hover:text-[#7A6A8E] transition-colors flex items-center gap-2"
            >
            <ArrowLeft className="w-5 h-5" />
            Back
            </button>

            <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[#4A4458]">Partner View</h1>
            <p className="text-[#7D7589] mt-1">Preview of partner home screen</p>
            </div>

            <div className="space-y-6">
            {/* Baby Quick Actions */}
            <BabyQuickActions />

            {/* Mood Card */}
            {latestMood && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-[#8B7A9F]" />
                    <p className="text-xs font-medium text-[#8B7A9F] uppercase tracking-wide">
                    Her Mood Today
                    </p>
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-20 h-20 rounded-full ${getMoodColor(latestMood.mood_value)} flex items-center justify-center shadow-sm`}>
                    <span className="text-3xl font-semibold text-[#4A4458]">
                        {Math.round(latestMood.mood_value / 10)}
                    </span>
                    </div>
                    <div className="flex-1">
                    <p className="text-xl font-semibold text-[#4A4458] mb-1">{getMoodLabel(latestMood.mood_value)}</p>
                    <p className="text-sm text-[#7D7589]">
                        {latestMood.time ? `Logged at ${latestMood.time}` : `Logged ${format(new Date(latestMood.created_date), 'h:mm a')}`}
                    </p>
                    {todayMoods.length > 1 && (
                        <p className="text-xs text-[#8B7A9F] mt-1">Logged {todayMoods.length} moods today</p>
                    )}
                    </div>
                </div>
                
                {/* Mood Chips */}
                {todayMoods.some(m => m.mood_label) && (
                    <div className="pt-3 border-t border-[#E8E4F3]">
                    <p className="text-xs text-[#7D7589] mb-2">Today's Feelings:</p>
                    <div className="flex flex-wrap gap-2">
                        {todayMoods
                        .filter(m => m.mood_label)
                        .map((mood, idx) => (
                            <div key={idx} className="inline-block px-3 py-1.5 bg-[#F5EEF8] rounded-full">
                            <span className="text-sm font-medium text-[#8B7A9F]">{mood.mood_label}</span>
                            </div>
                        ))}
                    </div>
                    </div>
                )}
                </div>
            )}

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-xs font-medium text-[#8B7A9F] mb-4 uppercase tracking-wide">
                Upcoming Tasks
                </p>
                <div className="grid grid-cols-2 gap-3">
                {nextFeeding ? (
                    <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-[#E8E4F3] to-[#EDD9E8] rounded-2xl">
                    <Clock className="w-6 h-6 text-[#8B7A9F]" />
                    <p className="text-xs font-medium text-[#4A4458]">Next Feeding</p>
                    <p className="text-sm font-semibold text-[#4A4458]">{format(nextFeeding, 'h:mm a')}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 p-4 bg-[#F5EEF8] rounded-2xl opacity-50">
                    <Clock className="w-6 h-6 text-[#8B7A9F]" />
                    <p className="text-xs font-medium text-[#7D7589]">Tracking...</p>
                    </div>
                )}
                
                {nextNap ? (
                    <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] rounded-2xl">
                    <Clock className="w-6 h-6 text-[#8B7A9F]" />
                    <p className="text-xs font-medium text-[#4A4458]">Next Nap</p>
                    <p className="text-sm font-semibold text-[#4A4458]">{format(nextNap, 'h:mm a')}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 p-4 bg-[#F5EEF8] rounded-2xl opacity-50">
                    <Clock className="w-6 h-6 text-[#8B7A9F]" />
                    <p className="text-xs font-medium text-[#7D7589]">Tracking...</p>
                    </div>
                )}
                </div>
            </div>

            {/* Support Chips - Show selected support for today */}
            {todaySupport.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-xs font-medium text-[#8B7A9F] mb-4 uppercase tracking-wide">
                    Support Requested Today
                </p>
                <div className="grid grid-cols-2 gap-2">
                    {todaySupport.map((request) => (
                    <div
                        key={request.id}
                        className="p-3 bg-[#C4B5D0] text-white rounded-xl text-sm text-center"
                    >
                        {request.request_text}
                    </div>
                    ))}
                </div>
                </div>
            )}

            {/* Send a Message */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-xs font-medium text-[#8B7A9F] mb-4 uppercase tracking-wide">
                Send a Message
                </p>
                <label htmlFor="partner-message" className="sr-only">Write a supportive message</label>
                <Textarea
                id="partner-message"
                name="partner-message"
                placeholder="Write a supportive message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="rounded-xl border-[#E8E4F3] mb-3"
                rows={3}
                maxLength={150}
                />
                <p className="text-xs text-[#7D7589] mb-3">{message.length}/150 characters</p>
                <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`w-full rounded-xl ${
                    messageSent
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-[#8B7A9F] hover:bg-[#7A6A8E]'
                } text-white`}
                >
                {messageSent ? '✓ Message Sent' : 'Send Message'}
                </Button>
                <p className="text-xs text-[#7D7589] mt-2 text-center italic">
                This will appear in her Affirmations
                </p>
            </div>

            {/* Journal Entries */}
            {profile?.share_journals && journals.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-xs font-medium text-[#8B7A9F] mb-4 uppercase tracking-wide">
                    Journal Entries
                </p>
                <div className="space-y-3">
                    {journals.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="p-4 bg-[#F5EEF8] rounded-xl">
                        <p className="text-xs text-[#7D7589] mb-2">
                        {format(new Date(entry.created_date), 'MMM d, yyyy')}
                        </p>
                        {entry.prompt && (
                        <p className="text-sm font-medium text-[#8B7A9F] mb-2">{entry.prompt}</p>
                        )}
                        <p className="text-sm text-[#4A4458] line-clamp-2">{entry.content}</p>
                    </div>
                    ))}
                </div>
                <Link
                    to={createPageUrl('PartnerJournalView')}
                    className="block text-center text-[#8B7A9F] font-medium mt-4 hover:text-[#7A6A8E] transition-colors"
                >
                    View All →
                </Link>
                </div>
            )}

            {/* Recommended Articles */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-xs font-medium text-[#8B7A9F] mb-4 uppercase tracking-wide">
                Recommended Articles
                </p>
                <div className="space-y-3">
                {articles.map((article) => (
                    <div key={article.id} className="p-4 bg-gradient-to-br from-[#E8E4F3] to-[#D9EEF2] rounded-2xl">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[#8B7A9F]" />
                        </div>
                        <div className="flex-1">
                        <h3 className="font-semibold text-[#4A4458] mb-1">{article.title}</h3>
                        <p className="text-sm text-[#7D7589]">{article.description}</p>
                        <span className="text-xs font-medium text-[#8B7A9F] bg-white/50 px-2 py-1 rounded-full mt-2 inline-block">
                            {article.tag}
                        </span>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Mindfulness Hub */}
            <MindfulnessHub onBreathingStart={() => setShowBreathing(true)} />
            </div>
        </div>

        {/* Bottom Navigation (Visual Only) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-[#E8E4F3]/50">
            <div className="max-w-lg mx-auto flex justify-around items-center py-2">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                <div
                    key={item.name}
                    className="flex flex-col items-center py-2 px-3 text-[#7D7589]"
                >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs mt-1 font-medium">{item.name}</span>
                </div>
                );
            })}
            </div>
        </nav>

        <AnimatePresence>
            {showBreathing && (
            <GuidedBreathing onClose={() => setShowBreathing(false)} />
            )}
        </AnimatePresence>
        </div>
    );
    }