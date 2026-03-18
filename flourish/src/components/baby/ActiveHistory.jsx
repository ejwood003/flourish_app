// POTENTIALLY DELETE

// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { format, isToday, subDays, isAfter } from 'date-fns';
// import { Milk, Baby, Droplet, Moon, MoreHorizontal, Filter, Trash2 } from 'lucide-react';
// import { base44 } from '@/api/base44Client';
// import { useQueryClient } from '@tanstack/react-query';
// import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';

// const iconMap = {
//   breastfeed: Baby,
//   bottle: Milk,
//   pump: Droplet,
//   nap: Moon,
//   diaper: Droplet,
//   other: MoreHorizontal,
// };

// const colorMap = {
//   breastfeed: 'bg-[#EDD9E8] text-[#B8A5C4]',
//   bottle: 'bg-[#E8E4F3] text-[#8B7A9F]',
//   pump: 'bg-[#D9EEF2] text-[#7AA5B8]',
//   nap: 'bg-[#D9EEF2] text-[#7AA5B8]',
//   diaper: 'bg-[#F5E6EA] text-[#B8A5C4]',
//   other: 'bg-[#F5F5F5] text-[#7D7589]',
// };

// const tabs = [
//   { id: 'today', label: 'Today' },
//   { id: '3days', label: '3 Days' },
//   { id: 'week', label: 'Week' },
// ];

// const activityTypes = [
//   { id: 'all', label: 'All' },
//   { id: 'breastfeed', label: 'Breastfeed' },
//   { id: 'bottle', label: 'Bottle' },
//   { id: 'pump', label: 'Pump' },
//   { id: 'nap', label: 'Nap' },
//   { id: 'diaper', label: 'Diaper' },
// ];

// export default function ActivityHistory({ activities }) {
//   const queryClient = useQueryClient();
//   const [activeTab, setActiveTab] = useState('today');
//   const [filterType, setFilterType] = useState('all');
//   const [showFilter, setShowFilter] = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

//   const handleDelete = async () => {
//     try {
//       await base44.entities.BabyActivity.delete(deleteDialog.id);
//       queryClient.invalidateQueries({ queryKey: ['babyActivities'] });
//     } catch (error) {
//       console.error('Error deleting activity:', error);
//     }
//     setDeleteDialog({ open: false, id: null });
//   };

//   const getFilteredActivities = () => {
//     const now = new Date();
//     let startDate;
//     let filtered = activities;
    
//     switch (activeTab) {
//       case 'today':
//         filtered = activities.filter(a => isToday(new Date(a.timestamp)));
//         break;
//       case '3days':
//         startDate = subDays(now, 3);
//         filtered = activities.filter(a => isAfter(new Date(a.timestamp), startDate));
//         break;
//       case 'week':
//         startDate = subDays(now, 7);
//         filtered = activities.filter(a => isAfter(new Date(a.timestamp), startDate));
//         break;
//     }

//     if (filterType !== 'all') {
//       filtered = filtered.filter(a => a.type === filterType);
//     }

//     return filtered;
//   };

//   const filtered = getFilteredActivities()
//     .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

//   const groupedByDate = filtered.reduce((acc, activity) => {
//     const date = format(new Date(activity.timestamp), 'yyyy-MM-dd');
//     if (!acc[date]) acc[date] = [];
//     acc[date].push(activity);
//     return acc;
//   }, {});

//   return (
//     <div className="bg-white rounded-3xl p-6 shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <p className="text-xs font-medium text-[#8B7A9F] uppercase tracking-wide">
//           Activity History
//         </p>
//         <button
//           onClick={() => setShowFilter(!showFilter)}
//           className="p-2 rounded-xl hover:bg-[#E8E4F3] transition-colors"
//         >
//           <Filter className={`w-4 h-4 ${filterType !== 'all' ? 'text-[#8B7A9F]' : 'text-[#7D7589]'}`} />
//         </button>
//       </div>

//       {showFilter && (
//         <div className="mb-4 p-3 bg-[#E8E4F3]/30 rounded-2xl">
//           <p className="text-xs font-medium text-[#7D7589] mb-2">Filter by type</p>
//           <div className="flex flex-wrap gap-2">
//             {activityTypes.map((type) => (
//               <button
//                 key={type.id}
//                 onClick={() => setFilterType(type.id)}
//                 className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
//                   filterType === type.id
//                     ? 'bg-[#8B7A9F] text-white'
//                     : 'bg-white text-[#7D7589] hover:bg-[#E8E4F3]'
//                 }`}
//               >
//                 {type.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Tab Toggle */}
//       <div className="flex gap-2 mb-4 p-1 bg-[#E8E4F3]/50 rounded-2xl">
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
//               activeTab === tab.id
//                 ? 'bg-white text-[#4A4458] shadow-sm'
//                 : 'text-[#7D7589]'
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Timeline */}
//       <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
//         {Object.entries(groupedByDate).length === 0 ? (
//           <p className="text-center text-[#7D7589] py-8">No activities recorded yet</p>
//         ) : (
//           Object.entries(groupedByDate).map(([date, dayActivities]) => (
//             <div key={date}>
//               <p className="text-xs font-medium text-[#7D7589] mb-3 flex items-center gap-2">
//                 <span className="w-1.5 h-1.5 rounded-full bg-[#8B7A9F]"></span>
//                 {isToday(new Date(date)) ? 'Today' : format(new Date(date), 'EEEE, MMM d')}
//               </p>
//               <div className="space-y-3 pl-4">
//                 {dayActivities.map((activity, index) => {
//                   const Icon = iconMap[activity.type] || MoreHorizontal;
//                   return (
//                     <motion.div
//                       key={activity.id}
//                       initial={{ opacity: 0, x: -10 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: index * 0.05 }}
//                       className="flex items-start gap-3 group"
//                     >
//                       <div className={`p-2 rounded-xl ${colorMap[activity.type]} flex-shrink-0`}>
//                         <Icon className="w-4 h-4" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-baseline justify-between gap-2">
//                           <p className="font-medium text-[#4A4458] capitalize text-sm">
//                             {activity.type.replace('_', ' ')}
//                           </p>
//                           <div className="flex items-center gap-2">
//                             <p className="text-xs text-[#7D7589] flex-shrink-0">
//                               {format(new Date(activity.timestamp), 'h:mm a')}
//                             </p>
//                             <button
//                               onClick={() => setDeleteDialog({ open: true, id: activity.id })}
//                               className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#F5E6EA] rounded transition-all"
//                             >
//                               <Trash2 className="w-3 h-3 text-[#8B4A4A]" />
//                             </button>
//                           </div>
//                         </div>
//                         <div className="text-xs text-[#7D7589] mt-1 flex flex-wrap gap-2">
//                           {activity.duration_minutes && (
//                             <span className="bg-[#E8E4F3]/50 px-2 py-0.5 rounded-full">
//                               {activity.duration_minutes} min
//                             </span>
//                           )}
//                           {activity.breast_side && (
//                             <span className="bg-[#EDD9E8]/50 px-2 py-0.5 rounded-full capitalize">
//                               {activity.breast_side}
//                             </span>
//                           )}
//                           {activity.amount_oz && (
//                             <span className="bg-[#D9EEF2]/50 px-2 py-0.5 rounded-full">
//                               {activity.amount_oz} oz
//                             </span>
//                           )}
//                         </div>
//                         {activity.notes && (
//                           <p className="text-xs text-[#7D7589] mt-1.5 italic">"{activity.notes}"</p>
//                         )}
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       <DeleteConfirmationDialog
//         open={deleteDialog.open}
//         onOpenChange={(open) => setDeleteDialog({ open, id: null })}
//         onConfirm={handleDelete}
//         title="Delete activity?"
//         description="This action cannot be undone."
//       />
//     </div>
//   );
// }