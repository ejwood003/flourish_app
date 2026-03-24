import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, ExternalLink } from 'lucide-react';

export default function RecommendedArticle() {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#C9B6CC]" />
                <p className="text-xs font-medium text-[#5A4B70] uppercase tracking-wide">
                    Recommended Reading
                </p>
            </div>

            <h3 className="text-lg font-semibold text-[#4A4458] mb-2">
                Understanding Postpartum Recovery
            </h3>
            <p className="text-sm text-[#5A4B70] mb-4">
                A comprehensive guide to physical and emotional recovery during the first few weeks after birth.
            </p>

            <button
                onClick={() => navigate(createPageUrl('ArticleView') + '?id=tip2&from=home')}
                className="inline-flex items-center gap-2 text-[#5A4B70] font-medium hover:text-[#7A6A8E] transition-colors"
                >
                Read More
                <ExternalLink className="w-4 h-4" />
            </button>
        </div>
    );
}