// POTENTIALLY DELETE/REMOVE PAGE
// import React from 'react';
// import { motion } from 'framer-motion';
// import { Utensils, Moon, Clock } from 'lucide-react';
// import { format, addMinutes, differenceInMinutes } from 'date-fns';

// export default function BabySummaryCards({ activities }) {
//     const getLastActivity = (type) => {
//         const types = type === 'feeding' ? ['breastfeed', 'bottle'] : [type];
//         return activities
//         .filter(a => types.includes(a.type))
//         .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
//     };

//     const calculateNextFeeding = () => {
//         const feedings = activities
//         .filter(a => ['breastfeed', 'bottle'].includes(a.type))
//         .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
//         .slice(0, 5);

//         if (feedings.length < 2) return null;

//         let totalMinutes = 0;
//         for (let i = 0; i < feedings.length - 1; i++) {
//         const diff = differenceInMinutes(
//             new Date(feedings[i].timestamp),
//             new Date(feedings[i + 1].timestamp)
//         );
//         totalMinutes += diff;
//         }
//         const avgMinutes = Math.round(totalMinutes / (feedings.length - 1));

//         if (feedings[0]) {
//         return addMinutes(new Date(feedings[0].timestamp), avgMinutes);
//         }
//         return null;
//     };

//     const calculateNextNap = () => {
//         const naps = activities
//         .filter(a => a.type === 'nap')
//         .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
//         .slice(0, 5);

//         if (naps.length < 2) return null;

//         let totalMinutes = 0;
//         for (let i = 0; i < naps.length - 1; i++) {
//         const diff = differenceInMinutes(
//             new Date(naps[i].timestamp),
//             new Date(naps[i + 1].timestamp)
//         );
//         totalMinutes += diff;
//         }
//         const avgMinutes = Math.round(totalMinutes / (naps.length - 1));

//         if (naps[0]) {
//         return addMinutes(new Date(naps[0].timestamp), avgMinutes);
//         }
//         return null;
//     };

//     const lastFeeding = getLastActivity('feeding');
//     const lastNap = getLastActivity('nap');
//     const nextFeeding = calculateNextFeeding();
//     const nextNap = calculateNextNap();

//     const cards = [
//         {
//         title: 'Last Feeding',
//         value: lastFeeding 
//             ? format(new Date(lastFeeding.timestamp), 'h:mm a')
//             : 'No data',
//         icon: Utensils,
//         color: 'from-[#EDD9E8] to-[#F5E6EA]',
//         iconColor: 'text-[#B8A5C4]',
//         },
//         {
//         title: 'Likely Next Feeding',
//         value: nextFeeding 
//             ? `~${format(nextFeeding, 'h:mm a')}`
//             : 'Tracking...',
//         subtitle: 'Based on recent patterns',
//         icon: Clock,
//         color: 'from-[#E8E4F3] to-[#F0EDF7]',
//         iconColor: 'text-[#8B7A9F]',
//         },
//         {
//         title: 'Last Nap',
//         value: lastNap 
//             ? format(new Date(lastNap.timestamp), 'h:mm a')
//             : 'No data',
//         icon: Moon,
//         color: 'from-[#D9EEF2] to-[#E4F3F7]',
//         iconColor: 'text-[#7AA5B8]',
//         },
//         {
//         title: 'Likely Next Nap',
//         value: nextNap 
//             ? `~${format(nextNap, 'h:mm a')}`
//             : 'Tracking...',
//         subtitle: 'Based on recent patterns',
//         icon: Clock,
//         color: 'from-[#D9EEF2] to-[#E4F3F7]',
//         iconColor: 'text-[#7AA5B8]',
//         },
//     ];

//     return (
//         <div className="grid grid-cols-2 gap-3">
//         {cards.map((card, index) => {
//             const Icon = card.icon;
//             return (
//             <motion.div
//                 key={card.title}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 shadow-sm`}
//             >
//                 <div className="flex items-start justify-between mb-2">
//                 <p className="text-xs font-medium text-[#7D7589]">{card.title}</p>
//                 <Icon className={`w-4 h-4 ${card.iconColor}`} />
//                 </div>
//                 <p className="text-lg font-semibold text-[#4A4458]">{card.value}</p>
//                 {card.subtitle && (
//                 <p className="text-xs text-[#7D7589] mt-1">{card.subtitle}</p>
//                 )}
//             </motion.div>
//             );
//         })}
//         </div>
//     );
// }