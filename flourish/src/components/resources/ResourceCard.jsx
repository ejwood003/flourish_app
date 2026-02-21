import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, FileText, Lightbulb, Play } from 'lucide-react';

const iconMap = {
meditations: Sparkles,
affirmations: Sparkles,
articles: FileText,
tips: Lightbulb,
};

const colorMap = {
meditations: 'from-[#E8DFF5] to-[#D4E5F7]',
affirmations: 'from-[#F2D7D9] to-[#E8DFF5]',
articles: 'from-[#D4E5F7] to-[#E8F5E8]',
tips: 'from-[#FEF3E8] to-[#F2D7D9]',
};

export default function ResourceCard({ resource, index }) {
const Icon = iconMap[resource.category] || BookOpen;

return (
<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    className={`bg-gradient-to-br ${colorMap[resource.category]} rounded-2xl p-5 shadow-sm cursor-pointer`}
>
    <div className="flex items-start justify-between mb-3">
    <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#9D8AA5]" />
    </div>
    {resource.category === 'meditations' && (
        <div className="flex items-center gap-1 text-xs text-[#9D8AA5] bg-white/50 px-2 py-1 rounded-full">
        <Play className="w-3 h-3" fill="currentColor" />
        {resource.duration}
        </div>
    )}
    </div>
    
    <h3 className="font-semibold text-[#4A4458] mb-1">{resource.title}</h3>
    <p className="text-sm text-[#7D7589] line-clamp-2">{resource.description}</p>
    
    <div className="mt-3">
    <span className="text-xs font-medium text-[#9D8AA5] capitalize">
        {resource.category}
    </span>
    </div>
</motion.div>
);
}