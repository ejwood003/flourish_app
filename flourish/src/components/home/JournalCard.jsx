import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen } from 'lucide-react';

export default function JournalCard() {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            {/* title  */}
            <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-[#C9B6CC]" />
                <p className="text-xs font-medium text-[#5A4B70] uppercase tracking-wide">
                    Journal
                </p>
            </div>

            <button onClick={() => navigate(createPageUrl('Journal'))}
            className="w-full py-4 bg-gradient-to-br from-[#EDD9E8] to-[#F5E6EA] rounded-2xl text-[#4A4458] font-medium hover:shadow-md transition-all"
            >
                Open Journal
            </button>
        </div>
    );
}