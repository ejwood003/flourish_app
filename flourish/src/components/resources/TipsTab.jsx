import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Search, Bookmark, FileText, Lightbulb, Filter } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const tips = [
{ id: 'tip1', title: 'Understanding Baby Sleep', description: 'Learn about newborn sleep patterns and what to expect in the first few months.', type: 'article', category: 'sleep', read: false },
{ id: 'tip2', title: 'Postpartum Recovery', description: 'Tips and insights for physical and emotional healing after birth.', type: 'article', category: 'recovery', read: false },
{ id: 'tip3', title: 'Quick Self-Care Ideas', description: '5-minute ways to care for yourself every day.', type: 'tip', category: 'mindfulness', read: false },
{ id: 'tip4', title: 'Partner Communication', description: 'How to ask for what you need during this transition.', type: 'tip', category: 'partner', read: false },
{ id: 'tip5', title: 'Breastfeeding Basics', description: 'Essential tips for establishing a feeding routine.', type: 'article', category: 'breastfeeding', read: false },
{ id: 'tip6', title: 'Managing Overwhelm', description: 'Practical strategies when everything feels like too much.', type: 'tip', category: 'mental_health', read: false },
{ id: 'tip7', title: 'Building Your Village', description: 'Finding and accepting support from others.', type: 'article', category: 'partner_support', read: false },
{ id: 'tip8', title: 'Sleep When Baby Sleeps', description: 'Why this advice matters and how to actually do it.', type: 'tip', category: 'sleep', read: false },
{ id: 'tip9', title: 'First Foods Guide', description: 'When and how to introduce solids to your baby.', type: 'article', category: 'feeding', read: false },
{ id: 'tip10', title: 'Baby Development Milestones', description: 'What to expect in your baby\'s first year.', type: 'article', category: 'development', read: false },
{ id: 'tip11', title: 'Mindful Parenting', description: 'Staying present during the early days.', type: 'tip', category: 'mindfulness', read: false },
{ id: 'tip12', title: 'Supporting Your Mental Health', description: 'Recognizing when you need help and how to ask for it.', type: 'article', category: 'mental_health', read: false },
];

export default function TipsTab() {
const navigate = useNavigate();
const [searchQuery, setSearchQuery] = useState('');
const [showSavedOnly, setShowSavedOnly] = useState(false);
const [categoryFilter, setCategoryFilter] = useState('all');
const [readFilter, setReadFilter] = useState('all');
const [showFilters, setShowFilters] = useState(false);
const queryClient = useQueryClient();

const { data: savedResources = [] } = useQuery({
queryKey: ['savedTips'],
queryFn: () => base44.entities.SavedResource.list('-created_date', 100),
});

const savedIds = savedResources
.filter(r => r.resource_type === 'tip')
.map(r => r.resource_id);

const filteredTips = tips.filter(t => {
const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase());
const matchesSaved = !showSavedOnly || savedIds.includes(t.id);
const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
const matchesRead = readFilter === 'all' || 
    (readFilter === 'read' && t.read) ||
    (readFilter === 'unread' && !t.read);
return matchesSearch && matchesSaved && matchesCategory && matchesRead;
});

const toggleSaved = async (tipId) => {
const existing = savedResources.find(
    r => r.resource_id === tipId && r.resource_type === 'tip'
);

if (existing) {
    await base44.entities.SavedResource.delete(existing.id);
} else {
    await base44.entities.SavedResource.create({
    resource_id: tipId,
    resource_type: 'tip',
    });
}
queryClient.invalidateQueries({ queryKey: ['savedTips'] });
};

return (
<div className="space-y-6">
    <div className="flex flex-col gap-3">
    <div className="flex gap-3">
        <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7A9F]" />
        <label htmlFor="tips-search" className="sr-only">Search articles and tips</label>
        <Input
            id="tips-search"
            name="tips-search"
            placeholder="Search articles and tips..."
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
                <p className="text-xs font-medium text-[#7D7589] mb-2">Read Status</p>
                <div className="flex flex-wrap gap-2">
                {['all', 'read', 'unread'].map(status => (
                    <button
                    key={status}
                    onClick={() => setReadFilter(status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        readFilter === status
                        ? 'bg-[#8B7A9F] text-white'
                        : 'bg-white text-[#7D7589]'
                    }`}
                    >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
                </div>
            </div>
            <div>
                <p className="text-xs font-medium text-[#7D7589] mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'mental_health', label: 'Mental Health' },
                    { id: 'breastfeeding', label: 'Breastfeeding' },
                    { id: 'sleep', label: 'Sleep' },
                    { id: 'partner', label: 'Partner' },
                    { id: 'feeding', label: 'Feeding' },
                    { id: 'recovery', label: 'Recovery' },
                    { id: 'partner_support', label: 'Partner & Support' },
                    { id: 'mindfulness', label: 'Mindfulness' },
                    { id: 'development', label: 'Development' },
                    { id: 'other', label: 'Other' },
                ].map(cat => (
                    <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        categoryFilter === cat.id
                        ? 'bg-[#8B7A9F] text-white'
                        : 'bg-white text-[#7D7589]'
                    }`}
                    >
                    {cat.label}
                    </button>
                ))}
                </div>
            </div>
            </div>
        </motion.div>
        )}
    </AnimatePresence>

    <button
        onClick={() => setShowSavedOnly(!showSavedOnly)}
        className={`py-2 px-4 rounded-xl font-medium transition-all ${
        showSavedOnly
            ? 'bg-[#8B7A9F] text-white'
            : 'bg-[#E8E4F3] text-[#7D7589]'
        }`}
    >
        <Bookmark className="w-4 h-4 inline mr-2" fill={showSavedOnly ? 'currentColor' : 'none'} />
        Saved
    </button>
    </div>

    <div className="space-y-3">
    {filteredTips.map((tip, index) => {
        const isSaved = savedIds.includes(tip.id);
        const Icon = tip.type === 'article' ? FileText : Lightbulb;
        return (
        <motion.div
            key={tip.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(createPageUrl('ArticleView') + `?id=${tip.id}&from=tips`)}
            className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
            <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEF3E8] to-[#F2D7D9] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[#C4A378]" />
            </div>
            <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[#4A4458]">{tip.title}</h3>
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    toggleSaved(tip.id);
                    }}
                    className="p-2 rounded-full hover:bg-[#F5EEF8] transition-colors"
                >
                    <Bookmark
                    className={`w-5 h-5 ${isSaved ? 'text-[#9D8AA5]' : 'text-[#9D8AA5]/30'}`}
                    fill={isSaved ? 'currentColor' : 'none'}
                    />
                </button>
                </div>
                <p className="text-sm text-[#7D7589] mb-3">{tip.description}</p>
                <span className="text-xs font-medium text-[#9D8AA5] capitalize bg-[#F5EEF8] px-3 py-1 rounded-full">
                {tip.type}
                </span>
            </div>
            </div>
        </motion.div>
        );
    })}
    </div>

    {filteredTips.length === 0 && (
    <div className="text-center py-12">
        <p className="text-[#7D7589]">No tips found</p>
    </div>
    )}
</div>
);
}