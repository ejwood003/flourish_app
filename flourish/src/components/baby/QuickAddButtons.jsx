    // import React, { useState } from 'react';
    // import { motion, AnimatePresence } from 'framer-motion';
    // import { Milk, Baby, Droplet, Moon, MoreHorizontal, X, Clock } from 'lucide-react';
    // import { Button } from '@/components/ui/button';
    // import { Input } from '@/components/ui/input';
    // import { Textarea } from '@/components/ui/textarea';
    // import { base44 } from '@/api/base44Client';
    // import { format } from 'date-fns';

    // const activityTypes = [
    // { id: 'breastfeed', label: 'Breastfeed', icon: Baby, color: 'bg-[#F2D7D9]', iconColor: 'text-[#C4A3A7]' },
    // { id: 'bottle', label: 'Bottle', icon: Milk, color: 'bg-[#E8DFF5]', iconColor: 'text-[#9D8AA5]' },
    // { id: 'pump', label: 'Pump', icon: Droplet, color: 'bg-[#D4E5F7]', iconColor: 'text-[#8AAFC4]' },
    // { id: 'nap', label: 'Nap', icon: Moon, color: 'bg-[#E8F5E8]', iconColor: 'text-[#8AC4A3]' },
    // { id: 'diaper', label: 'Diaper', icon: Droplet, color: 'bg-[#FEF3E8]', iconColor: 'text-[#C4A378]' },
    // { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'bg-[#F5F5F5]', iconColor: 'text-[#7D7589]' },
    // ];

    // export default function QuickAddButtons({ onActivityAdded }) {
    // const [selectedType, setSelectedType] = useState(null);
    // const [formData, setFormData] = useState({
    //     timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    //     duration_minutes: '',
    //     breast_side: '',
    //     notes: '',
    //     amount_oz: '',
    // });
    // const [saving, setSaving] = useState(false);

    // const handleSave = async () => {
    //     if (!selectedType) return;
    //     setSaving(true);

    //     try {
    //     const data = {
    //         type: selectedType,
    //         timestamp: new Date(formData.timestamp).toISOString(),
    //         ...(formData.duration_minutes && { duration_minutes: parseInt(formData.duration_minutes) }),
    //         ...(formData.breast_side && { breast_side: formData.breast_side }),
    //         ...(formData.notes && { notes: formData.notes }),
    //         ...(formData.amount_oz && { amount_oz: parseFloat(formData.amount_oz) }),
    //     };

    //     await base44.entities.BabyActivity.create(data);
    //     onActivityAdded?.();
    //     setSelectedType(null);
    //     setFormData({
    //         timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    //         duration_minutes: '',
    //         breast_side: '',
    //         notes: '',
    //         amount_oz: '',
    //     });
    //     } catch (e) {
    //     console.error(e);
    //     } finally {
    //     setSaving(false);
    //     }
    // };

    // return (
    //     <div className="bg-white rounded-3xl p-6 shadow-sm">
    //     <p className="text-xs font-medium text-[#9D8AA5] mb-4 uppercase tracking-wide">
    //         Quick Add
    //     </p>

    //     <div className="grid grid-cols-3 gap-3">
    //         {activityTypes.map((type) => {
    //         const Icon = type.icon;
    //         const isSelected = selectedType === type.id;
    //         return (
    //             <motion.button
    //             key={type.id}
    //             whileTap={{ scale: 0.95 }}
    //             onClick={() => setSelectedType(isSelected ? null : type.id)}
    //             className={`py-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-200 ${
    //                 isSelected
    //                 ? 'ring-2 ring-[#9D8AA5] ring-offset-2'
    //                 : ''
    //             } ${type.color}`}
    //             >
    //             <Icon className={`w-6 h-6 ${type.iconColor}`} />
    //             <span className="text-xs font-medium text-[#4A4458]">{type.label}</span>
    //             </motion.button>
    //         );
    //         })}
    //     </div>

    //     <AnimatePresence>
    //         {selectedType && (
    //         <motion.div
    //             initial={{ opacity: 0, height: 0 }}
    //             animate={{ opacity: 1, height: 'auto' }}
    //             exit={{ opacity: 0, height: 0 }}
    //             className="mt-4 space-y-4 overflow-hidden"
    //         >
    //             <div className="flex items-center gap-2">
    //             <Clock className="w-4 h-4 text-[#9D8AA5]" />
    //             <Input
    //                 type="datetime-local"
    //                 value={formData.timestamp}
    //                 onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
    //                 className="rounded-xl border-[#E8DFF5] focus:border-[#9D8AA5] focus:ring-[#9D8AA5]"
    //             />
    //             </div>

    //             {selectedType === 'breastfeed' && (
    //             <div className="flex gap-2">
    //                 {['left', 'right', 'both'].map((side) => (
    //                 <button
    //                     key={side}
    //                     onClick={() => setFormData({ ...formData, breast_side: side })}
    //                     className={`flex-1 py-2 rounded-xl capitalize font-medium transition-all ${
    //                     formData.breast_side === side
    //                         ? 'bg-[#9D8AA5] text-white'
    //                         : 'bg-[#F5EEF8] text-[#7D7589]'
    //                     }`}
    //                 >
    //                     {side}
    //                 </button>
    //                 ))}
    //             </div>
    //             )}

    //             {['breastfeed', 'nap', 'pump'].includes(selectedType) && (
    //             <Input
    //                 type="number"
    //                 placeholder="Duration (minutes)"
    //                 value={formData.duration_minutes}
    //                 onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
    //                 className="rounded-xl border-[#E8DFF5] focus:border-[#9D8AA5] focus:ring-[#9D8AA5]"
    //             />
    //             )}

    //             {['bottle', 'pump'].includes(selectedType) && (
    //             <Input
    //                 type="number"
    //                 step="0.5"
    //                 placeholder="Amount (oz)"
    //                 value={formData.amount_oz}
    //                 onChange={(e) => setFormData({ ...formData, amount_oz: e.target.value })}
    //                 className="rounded-xl border-[#E8DFF5] focus:border-[#9D8AA5] focus:ring-[#9D8AA5]"
    //             />
    //             )}

    //             <Textarea
    //             placeholder="Notes (optional)"
    //             value={formData.notes}
    //             onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
    //             className="rounded-xl border-[#E8DFF5] focus:border-[#9D8AA5] focus:ring-[#9D8AA5] resize-none"
    //             rows={2}
    //             />

    //             <div className="flex gap-3">
    //             <Button
    //                 variant="outline"
    //                 onClick={() => setSelectedType(null)}
    //                 className="flex-1 rounded-xl border-[#E8DFF5] text-[#7D7589]"
    //             >
    //                 Cancel
    //             </Button>
    //             <Button
    //                 onClick={handleSave}
    //                 disabled={saving}
    //                 className="flex-1 rounded-xl bg-[#9D8AA5] hover:bg-[#8A7792] text-white"
    //             >
    //                 {saving ? 'Saving...' : 'Save'}
    //             </Button>
    //             </div>
    //         </motion.div>
    //         )}
    //     </AnimatePresence>
    //     </div>
    // );
    // }