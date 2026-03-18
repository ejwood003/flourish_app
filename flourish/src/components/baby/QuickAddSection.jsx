import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Milk, Moon, MoreHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

import { Smile } from 'lucide-react';

const mainTypes = [
  { id: 'feeding', label: 'Feeding', icon: Milk, color: 'from-[#F5E6EA] to-[#EDD9E8]' },
  { id: 'nap', label: 'Nap', icon: Moon, color: 'from-[#D9EEF2] to-[#E8E4F3]' },
  { id: 'mood', label: 'Mood', icon: Smile, color: 'from-[#EDD9E8] to-[#F5E6EA]' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'from-[#E8E4F3] to-[#EDD9E8]' },
];

const feedingSubTypes = [
  { id: 'breastfeed', label: 'Breastfeeding' },
  { id: 'bottle', label: 'Bottle' },
  { id: 'other', label: 'Other' },
];

export default function QuickAddSection({ onActivityAdded, editingActivity, onCancelEdit }) {
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedFeedingType, setSelectedFeedingType] = useState(null);
  const [formData, setFormData] = useState({
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    breast_side: '',
    duration_minutes: '',
    amount_oz: '',
    food_type: '',
    food_amount: '',
    nap_start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    nap_end: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    custom_type: '',
    notes: '',
    baby_mood_value: 50,
    baby_mood_tags: [],
  });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (editingActivity) {
      const timestamp = format(new Date(editingActivity.timestamp), "yyyy-MM-dd'T'HH:mm");
      
      if (editingActivity.type === 'breastfeed' || editingActivity.type === 'bottle') {
        setSelectedMain('feeding');
        setSelectedFeedingType(editingActivity.type);
      } else if (editingActivity.type === 'nap') {
        setSelectedMain('nap');
        const endTime = editingActivity.duration_minutes
          ? format(new Date(new Date(editingActivity.timestamp).getTime() + editingActivity.duration_minutes * 60000), "yyyy-MM-dd'T'HH:mm")
          : timestamp;
        setFormData(prev => ({ ...prev, nap_start: timestamp, nap_end: endTime }));
      } else if (editingActivity.type === 'other') {
        setSelectedMain('other');
      }

      setFormData(prev => ({
        ...prev,
        timestamp,
        breast_side: editingActivity.breast_side || '',
        duration_minutes: editingActivity.duration_minutes?.toString() || '',
        amount_oz: editingActivity.amount_oz?.toString() || '',
        food_type: editingActivity.food_type || '',
        food_amount: editingActivity.food_amount || '',
        custom_type: editingActivity.custom_type || '',
        notes: editingActivity.notes || '',
      }));
    }
  }, [editingActivity]);

  const resetForm = () => {
    setSelectedMain(null);
    setSelectedFeedingType(null);
    setFormData({
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      breast_side: '',
      duration_minutes: '',
      amount_oz: '',
      food_type: '',
      food_amount: '',
      nap_start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      nap_end: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      custom_type: '',
      notes: '',
      baby_mood_value: 50,
      baby_mood_tags: [],
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let data = {};
      
      if (selectedMain === 'feeding') {
        data = {
          type: selectedFeedingType,
          timestamp: new Date(formData.timestamp).toISOString(),
          notes: formData.notes || undefined,
        };
        
        if (selectedFeedingType === 'breastfeed') {
          data.breast_side = formData.breast_side;
          data.duration_minutes = formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined;
        } else if (selectedFeedingType === 'bottle') {
          data.amount_oz = formData.amount_oz ? parseFloat(formData.amount_oz) : undefined;
        } else {
          data.food_type = formData.food_type;
          data.food_amount = formData.food_amount;
        }
      } else if (selectedMain === 'nap') {
        const start = new Date(formData.nap_start);
        const end = formData.nap_end ? new Date(formData.nap_end) : null;
        const duration = end ? Math.round((end - start) / 60000) : undefined;
        
        data = {
          type: 'nap',
          timestamp: start.toISOString(),
          duration_minutes: duration,
          notes: formData.notes || undefined,
        };
      } else if (selectedMain === 'mood') {
        await base44.entities.BabyMood.create({
          mood_value: formData.baby_mood_value,
          timestamp: new Date(formData.timestamp).toISOString(),
          tags: formData.baby_mood_tags,
        });
        onActivityAdded?.();
        resetForm();
        setSaving(false);
        return;
      } else if (selectedMain === 'other') {
        data = {
          type: 'other',
          timestamp: new Date(formData.timestamp).toISOString(),
          custom_type: formData.custom_type,
          notes: formData.notes || undefined,
        };
      }

      if (editingActivity) {
        await base44.entities.BabyActivity.update(editingActivity.id, data);
      } else {
        await base44.entities.BabyActivity.create(data);
      }
      onActivityAdded?.();
      resetForm();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-[#8B7A9F] uppercase tracking-wide">
          {editingActivity ? 'Edit Activity' : 'Quick Add'}
        </p>
        {editingActivity && (
          <button
            onClick={() => {
              resetForm();
              onCancelEdit?.();
            }}
            className="text-xs text-[#7D7589] hover:text-[#8B7A9F]"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {mainTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedMain === type.id;
          return (
            <motion.button
              key={type.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedMain(type.id);
                setSelectedFeedingType(null);
              }}
              className={`py-6 rounded-2xl flex flex-col items-center gap-3 transition-all bg-gradient-to-br ${type.color} ${
                isSelected ? 'ring-2 ring-[#8B7A9F] ring-offset-2' : ''
              }`}
            >
              <Icon className="w-7 h-7 text-[#8B7A9F]" />
              <span className="text-sm font-medium text-[#4A4458]">{type.label}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedMain === 'feeding' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <p className="text-sm text-[#7D7589] mb-3">Select feeding type:</p>
            <div className="flex gap-2 mb-4">
              {feedingSubTypes.map((subType) => (
                <button
                  key={subType.id}
                  onClick={() => setSelectedFeedingType(subType.id)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    selectedFeedingType === subType.id
                      ? 'bg-[#8B7A9F] text-white'
                      : 'bg-[#F5EEF8] hover:bg-[#E8E4F3] text-[#4A4458]'
                  }`}
                >
                  {subType.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {selectedMain === 'feeding' && selectedFeedingType === 'breastfeed' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4 overflow-hidden"
          >
            <div>
              <label htmlFor="breastfeed-time" className="text-sm text-[#7D7589] mb-2 block">Time</label>
              <Input
                id="breastfeed-time"
                name="breastfeed-time"
                type="datetime-local"
                value={formData.timestamp}
                onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                className="border-[#E8E4F3]"
              />
            </div>

            <div>
              <p className="text-sm text-[#7D7589] mb-2">Side</p>
              <div className="flex gap-2">
                {['left', 'right', 'both'].map((side) => (
                  <button
                    key={side}
                    onClick={() => setFormData({ ...formData, breast_side: side })}
                    className={`flex-1 py-2 rounded-xl capitalize font-medium transition-all ${
                      formData.breast_side === side
                        ? 'bg-[#8B7A9F] text-white'
                        : 'bg-[#F5EEF8] text-[#7D7589]'
                    }`}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="breastfeed-duration" className="text-sm text-[#7D7589] mb-2 block">Duration (minutes)</label>
              <Input
                id="breastfeed-duration"
                name="breastfeed-duration"
                type="number"
                placeholder="Duration (minutes)"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                className="border-[#E8E4F3]"
              />
            </div>

            <div>
              <label htmlFor="breastfeed-notes" className="text-sm text-[#7D7589] mb-2 block">Notes (optional)</label>
              <Textarea
                id="breastfeed-notes"
                name="breastfeed-notes"
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="border-[#E8E4F3]"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { resetForm(); onCancelEdit?.(); }} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#8B7A9F]">
                {saving ? (editingActivity ? 'Updating...' : 'Saving...') : (editingActivity ? 'Update' : 'Save')}
              </Button>
            </div>
          </motion.div>
        )}

        {selectedMain === 'feeding' && selectedFeedingType === 'bottle' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4 overflow-hidden"
          >
            <div>
              <label htmlFor="bottle-time" className="text-sm text-[#7D7589] mb-2 block">Time</label>
              <Input
                id="bottle-time"
                name="bottle-time"
                type="datetime-local"
                value={formData.timestamp}
                onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                className="border-[#E8E4F3]"
              />
            </div>

            <div>
              <label htmlFor="bottle-amount" className="text-sm text-[#7D7589] mb-2 block">Amount (oz)</label>
              <Input
                id="bottle-amount"
                name="bottle-amount"
                type="number"
                step="0.5"
                placeholder="Amount (oz)"
                value={formData.amount_oz}
                onChange={(e) => setFormData({ ...formData, amount_oz: e.target.value })}
                className="border-[#E8E4F3]"
              />
            </div>

            <div>
              <label htmlFor="bottle-notes" className="text-sm text-[#7D7589] mb-2 block">Notes (optional)</label>
              <Textarea
                id="bottle-notes"
                name="bottle-notes"
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="border-[#E8E4F3]"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { resetForm(); onCancelEdit?.(); }} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#8B7A9F]">
                {saving ? (editingActivity ? 'Updating...' : 'Saving...') : (editingActivity ? 'Update' : 'Save')}
              </Button>
            </div>
          </motion.div>
        )}

        {selectedMain === 'feeding' && selectedFeedingType === 'other' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4 overflow-hidden"
          >
            <div>
              <label htmlFor="feeding-other-time" className="text-sm text-[#7D7589] mb-2 block">Time</label>
              <Input
                id="feeding-other-time"
                name="feeding-other-time"
                type="datetime-local"
                value={formData.timestamp}
                onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                className="border-[#E8E4F3]"
              />
            </div>

            <div>
              <label htmlFor="food-type" className="text-sm text-[#7D7589] mb-2 block">Food type</label>
              <Input
                id="food-type"
                name="food-type"
                placeholder="Food type (e.g., Carrots)"
                value={formData.food_type}
                onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
                className="border-[#E8E4F3]"
              />
            </div>

            <div>
              <label htmlFor="food-amount" className="text-sm text-[#7D7589] mb-2 block">Amount</label>
              <Input
                id="food-amount"
                name="food-amount"
                placeholder="Amount"
                value={formData.food_amount}
                onChange={(e) => setFormData({ ...formData, food_amount: e.target.value })}
                className="border-[#E8E4F3]"
              />
            </div>

            <div>
              <label htmlFor="feeding-other-notes" className="text-sm text-[#7D7589] mb-2 block">Notes (optional)</label>
              <Textarea
                id="feeding-other-notes"
                name="feeding-other-notes"
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="border-[#E8E4F3]"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { resetForm(); onCancelEdit?.(); }} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#8B7A9F]">
                {saving ? (editingActivity ? 'Updating...' : 'Saving...') : (editingActivity ? 'Update' : 'Save')}
              </Button>
            </div>
          </motion.div>
        )}

        {selectedMain === 'nap' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4 overflow-hidden"
          >
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setFormData({
                    ...formData,
                    nap_start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                    nap_end: ''
                  });
                }}
                className="flex-1 bg-[#D9EEF2] hover:bg-[#C5E4EC] text-[#4A4458]"
              >
                Start Nap
              </Button>
              <Button
                onClick={() => {
                  setFormData({
                    ...formData,
                    nap_end: format(new Date(), "yyyy-MM-dd'T'HH:mm")
                  });
                }}
                className="flex-1 bg-[#EDD9E8] hover:bg-[#E0C7D9] text-[#4A4458]"
              >
                End Nap
              </Button>
            </div>

            <div>
              <label htmlFor="nap-start" className="text-sm text-[#7D7589] mb-2 block">Start Time</label>
              <Input
                id="nap-start"
                name="nap-start"
                type="datetime-local"
                value={formData.nap_start}
                onChange={(e) => setFormData({ ...formData, nap_start: e.target.value })}
                className="border-[#E8E4F3]"
              />
            </div>

            <div>
              <label htmlFor="nap-end" className="text-sm text-[#7D7589] mb-2 block">End Time (optional)</label>
              <Input
                id="nap-end"
                name="nap-end"
                type="datetime-local"
                value={formData.nap_end}
                onChange={(e) => setFormData({ ...formData, nap_end: e.target.value })}
                className="border-[#E8E4F3]"
              />
            </div>

            <div>
              <label htmlFor="nap-notes" className="text-sm text-[#7D7589] mb-2 block">Notes (optional)</label>
              <Textarea
                id="nap-notes"
                name="nap-notes"
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="border-[#E8E4F3]"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { resetForm(); onCancelEdit?.(); }} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#8B7A9F]">
                {saving ? (editingActivity ? 'Updating...' : 'Saving...') : (editingActivity ? 'Update' : 'Save')}
              </Button>
            </div>
          </motion.div>
        )}

        {selectedMain === 'mood' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4 overflow-hidden"
          >
            <div>
              <label htmlFor="mood-time" className="text-sm text-[#7D7589] mb-2 block">Time</label>
              <Input
                id="mood-time"
                name="mood-time"
                type="datetime-local"
                value={formData.timestamp}
                onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                className="border-[#E8E4F3]"
              />
            </div>

            <div>
              <label htmlFor="baby-mood-slider" className="text-sm text-[#7D7589] mb-2 block">How is baby feeling?</label>
              <div className="relative mb-6">
                <div className="h-8 rounded-full bg-gradient-to-r from-[#D9EEF2] via-[#E8E4F3] to-[#EDD9E8]" />
                <input
                  id="baby-mood-slider"
                  name="baby-mood-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={formData.baby_mood_value}
                  onChange={(e) => setFormData({ ...formData, baby_mood_value: parseInt(e.target.value) })}
                  className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
                />
                <div
                  className="absolute top-0 w-12 h-12 -mt-2 bg-white rounded-full shadow-lg border-2 border-[#8B7A9F] pointer-events-none flex items-center justify-center text-xl"
                  style={{ left: `calc(${formData.baby_mood_value}% - 24px)` }}
                >
                  {formData.baby_mood_value >= 75 ? '😊' : formData.baby_mood_value >= 50 ? '🙂' : formData.baby_mood_value >= 25 ? '😕' : '😢'}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-[#7D7589] mb-2">Tags (optional)</p>
              <div className="flex flex-wrap gap-2">
                {['Calm', 'Happy', 'Fussy', 'Crying', 'Sleepy', 'Overtired', 'Hungry', 'Gassy', 'Playful', 'Overstimulated'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const tags = formData.baby_mood_tags.includes(tag)
                        ? formData.baby_mood_tags.filter(t => t !== tag)
                        : [...formData.baby_mood_tags, tag];
                      setFormData({ ...formData, baby_mood_tags: tags });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      formData.baby_mood_tags.includes(tag)
                        ? 'bg-[#8B7A9F] text-white'
                        : 'bg-[#E8E4F3] text-[#7D7589]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { resetForm(); onCancelEdit?.(); }} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#8B7A9F]">
                {saving ? (editingActivity ? 'Updating...' : 'Saving...') : (editingActivity ? 'Update' : 'Save')}
              </Button>
            </div>
          </motion.div>
        )}

        {selectedMain === 'other' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4 overflow-hidden"
          >
            <div>
              <label htmlFor="other-time" className="text-sm text-[#7D7589] mb-2 block">Time</label>
              <Input
                id="other-time"
                name="other-time"
                type="datetime-local"
                value={formData.timestamp}
                onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                className="border-[#E8E4F3]"
              />
            </div>

            <div>
              <label htmlFor="other-custom-type" className="text-sm text-[#7D7589] mb-2 block">Type</label>
              <Input
                id="other-custom-type"
                name="other-custom-type"
                placeholder="Type (e.g., Diaper change, Medicine)"
                value={formData.custom_type}
                onChange={(e) => setFormData({ ...formData, custom_type: e.target.value })}
                className="border-[#E8E4F3]"
              />
            </div>

            <div>
              <label htmlFor="other-notes" className="text-sm text-[#7D7589] mb-2 block">Notes (optional)</label>
              <Textarea
                id="other-notes"
                name="other-notes"
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="border-[#E8E4F3]"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { resetForm(); onCancelEdit?.(); }} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#8B7A9F]">
                {saving ? (editingActivity ? 'Updating...' : 'Saving...') : (editingActivity ? 'Update' : 'Save')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}