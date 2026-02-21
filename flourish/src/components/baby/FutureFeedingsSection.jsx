    import React from 'react';
    import { Milk, Moon, Clock } from 'lucide-react';
    import { format, addMinutes, differenceInMinutes } from 'date-fns';

    export default function FutureFeedingsSection({ activities }) {
    const calculateNextFeeding = () => {
        const feedings = activities
        .filter(a => ['breastfeed', 'bottle'].includes(a.type))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

        if (feedings.length < 2) return null;

        let totalMinutes = 0;
        for (let i = 0; i < feedings.length - 1; i++) {
        const diff = differenceInMinutes(
            new Date(feedings[i].timestamp),
            new Date(feedings[i + 1].timestamp)
        );
        totalMinutes += diff;
        }
        const avgMinutes = Math.round(totalMinutes / (feedings.length - 1));

        if (feedings[0]) {
        return addMinutes(new Date(feedings[0].timestamp), avgMinutes);
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
        const diff = differenceInMinutes(
            new Date(naps[i].timestamp),
            new Date(naps[i + 1].timestamp)
        );
        totalMinutes += diff;
        }
        const avgMinutes = Math.round(totalMinutes / (naps.length - 1));

        if (naps[0]) {
        return addMinutes(new Date(naps[0].timestamp), avgMinutes);
        }
        return null;
    };

    const nextFeeding = calculateNextFeeding();
    const nextNap = calculateNextNap();

    const getTimeUntil = (futureTime) => {
        if (!futureTime) return null;
        const diff = differenceInMinutes(futureTime, new Date());
        if (diff < 0) return 'Overdue';
        if (diff < 60) return `${diff} min`;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
        <p className="text-xs font-medium text-[#8B7A9F] mb-4 uppercase tracking-wide">
            Future Feedings
        </p>

        <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gradient-to-br from-[#EDD9E8] to-[#F5E6EA] rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
                <Milk className="w-5 h-5 text-[#8B7A9F]" />
                <p className="text-xs font-medium text-[#7D7589]">Next Feeding</p>
            </div>
            {nextFeeding ? (
                <>
                <p className="text-lg font-semibold text-[#4A4458]">
                    {format(nextFeeding, 'h:mm a')}
                </p>
                <p className="text-xs text-[#7D7589] mt-1">
                    in {getTimeUntil(nextFeeding)}
                </p>
                </>
            ) : (
                <p className="text-sm text-[#7D7589]">Tracking...</p>
            )}
            </div>

            <div className="p-4 bg-gradient-to-br from-[#D9EEF2] to-[#E8E4F3] rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
                <Moon className="w-5 h-5 text-[#8B7A9F]" />
                <p className="text-xs font-medium text-[#7D7589]">Next Nap</p>
            </div>
            {nextNap ? (
                <>
                <p className="text-lg font-semibold text-[#4A4458]">
                    {format(nextNap, 'h:mm a')}
                </p>
                <p className="text-xs text-[#7D7589] mt-1">
                    in {getTimeUntil(nextNap)}
                </p>
                </>
            ) : (
                <p className="text-sm text-[#7D7589]">Tracking...</p>
            )}
            </div>
        </div>
        </div>
    );
    }