import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Search, Play, Star, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const meditations = [
{ id: 'med1', title: 'Morning Calm', description: 'A gentle meditation to start your day with peace and intention.', duration: 5, category: 'general' },
{ id: 'med2', title: 'Nursing Relaxation', description: 'Find calm and connection during breastfeeding sessions.', duration: 10, category: 'breastfeeding' },
{ id: 'med3', title: 'Sleep Recovery', description: 'Restore your energy with this deeply relaxing guided rest.', duration: 15, category: 'sleep' },
{ id: 'med4', title: 'Breath & Release', description: 'Let go of tension with gentle breathing exercises.', duration: 7, category: 'general' },
{ id: 'med5', title: 'Peaceful Feeding', description: 'Create a calm space for you and baby during feeds.', duration: 12, category: 'breastfeeding' },
{ id: 'med6', title: 'Night Wind Down', description: 'Prepare your body and mind for restful sleep.', duration: 10, category: 'sleep' },
{ id: 'med7', title: 'Quick Reset', description: 'A brief meditation for when you only have a few minutes.', duration: 5, category: 'general' },
{ id: 'med8', title: 'Deep Sleep Support', description: 'Longer meditation for deep rest and recovery.', duration: 20, category: 'sleep' },
{ id: 'med9', title: 'Partner Connection', description: 'A shared meditation to strengthen your bond during this transition.', duration: 10, category: 'partner' },
];

export default function MeditationsTab() {
const navigate = useNavigate();
const [searchQuery, setSearchQuery] = useState('');
const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
const [categoryFilter, setCategoryFilter] = useState('all');
const [durationFilter, setDurationFilter] = useState('all');
const [showFilters, setShowFilters] = useState(false);
const queryClient = useQueryClient();

const { data: savedResources = [] } = useQuery({
queryKey: ['savedMeditations'],
queryFn: () => base44.entities.SavedResource.list('-created_date', 100),
});

const favoriteIds = savedResources
.filter(r => r.resource_type === 'meditation')
.map(r => r.resource_id);

const filteredMeditations = meditations.filter(m => {
const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase());
const matchesFavorites = !showFavoritesOnly || favoriteIds.includes(m.id);
const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
const matchesDuration = durationFilter === 'all' || 
    (durationFilter === 'short' && m.duration <= 7) ||
    (durationFilter === 'medium' && m.duration > 7 && m.duration <= 12) ||
    (durationFilter === 'long' && m.duration > 12);
return matchesSearch && matchesFavorites && matchesCategory && matchesDuration;
});

const toggleFavorite = async (meditationId) => {
const existing = savedResources.find(
    r => r.resource_id === meditationId && r.resource_type === 'meditation'
);

if (existing) {
    await base44.entities.SavedResource.delete(existing.id);
} else {
    await base44.entities.SavedResource.create({
    resource_id: meditationId,
    resource_type: 'meditation',
    });
}
queryClient.invalidateQueries({ queryKey: ['savedMeditations'] });
};

return (
<div className="space-y-6">
    <div className="flex flex-col gap-3">
    <div className="flex gap-3">
        <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7A9F]" />
        <label htmlFor="meditation-search" className="sr-only">Search meditations</label>
        <Input
            id="meditation-search"
            name="meditation-search"
            placeholder="Search meditations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F] focus:ring-[#8B7A9F]"
        />
        </div>
        <button
        onClick={() => setShowFilters(!showFilters)}
        className={`p-3 rounded-xl transition-colors ${
            showFilters ? 'bg-[#8B7A9F] text-white' : 'bg-[#E8E4F3] text-[#8B7A9F]'
        }`}
        >
        <Filter className="w-4 h-4" />
        </button>
    </div>

    <AnimatePresence>
        {showFilters && (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
        >
            <div className="bg-[#E8E4F3]/30 rounded-2xl p-4 space-y-3">
            <div>
                <p className="text-xs font-medium text-[#5A4B70] mb-2">Type</p>
                <div className="flex flex-wrap gap-2">
                {['all', 'general', 'breastfeeding', 'sleep', 'partner'].map(cat => (
                    <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        categoryFilter === cat
                        ? 'bg-[#8B7A9F] text-white'
                        : 'bg-white text-[#5A4B70]'
                    }`}
                    >
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
                </div>
            </div>
            <div>
                <p className="text-xs font-medium text-[#5A4B70] mb-2">Duration</p>
                <div className="flex flex-wrap gap-2">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'short', label: '≤ 7 min' },
                    { id: 'medium', label: '8-12 min' },
                    { id: 'long', label: '12+ min' },
                ].map(dur => (
                    <button
                    key={dur.id}
                    onClick={() => setDurationFilter(dur.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        durationFilter === dur.id
                        ? 'bg-[#8B7A9F] text-white'
                        : 'bg-white text-[#5A4B70]'
                    }`}
                    >
                    {dur.label}
                    </button>
                ))}
                </div>
            </div>
            </div>
        </motion.div>
        )}
    </AnimatePresence>

    <button
        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        className={`py-2 px-4 rounded-xl font-medium transition-all flex items-center gap-2 ${
        showFavoritesOnly
            ? 'bg-[#8B7A9F] text-white'
            : 'bg-[#E8E4F3] text-[#5A4B70]'
        }`}
    >
        <Star className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
        My Favorites
    </button>
    </div>

    <div className="space-y-3">
    {filteredMeditations.map((meditation, index) => {
        const isFavorite = favoriteIds.includes(meditation.id);
        return (
        <motion.div
            key={meditation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gradient-to-br from-[#E8E4F3] to-[#D9EEF2] rounded-2xl p-5 shadow-sm"
        >
            <div className="flex items-start justify-between mb-3">
            <div>
                <h3 className="font-semibold text-[#4A4458] mb-1">{meditation.title}</h3>
                <p className="text-sm text-[#5A4B70]">{meditation.description}</p>
            </div>
            <button
                onClick={() => toggleFavorite(meditation.id)}
                className="p-2 rounded-full hover:bg-white/50 transition-colors flex-shrink-0"
            >
                <Star
                className={`w-5 h-5 ${isFavorite ? 'text-[#8B7A9F]' : 'text-[#8B7A9F]/30'}`}
                fill={isFavorite ? 'currentColor' : 'none'}
                />
            </button>
            </div>
            <div className="flex items-center justify-between">
            <span className="text-xs text-[#8B7A9F] bg-white/50 px-3 py-1 rounded-full">
                {meditation.duration} min
            </span>
            <button 
                onClick={() => navigate(createPageUrl('LiveMeditation') + `?type=${meditation.category}&duration=${meditation.duration}&from=meditations`)}
                className="flex items-center gap-2 bg-[#7D6F99] text-white px-4 py-2 rounded-xl hover:bg-[#7A6B8D] transition-colors"
            >
                <Play className="w-4 h-4" fill="currentColor" />
                <span className="text-sm font-medium">Play</span>
            </button>
            </div>
        </motion.div>
        );
    })}
    </div>

    {filteredMeditations.length === 0 && (
    <div className="text-center py-12">
        <p className="text-[#5A4B70]">No meditations found</p>
    </div>
    )}
</div>
);
}