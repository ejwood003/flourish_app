    import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { format } from 'date-fns';

    export default function EditBabyActivityDialog({ activity, open, onOpenChange, onSave }) {
    const [type, setType] = useState('breastfeed');
    const [timestamp, setTimestamp] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [breastSide, setBreastSide] = useState('left');
    const [amountOz, setAmountOz] = useState('');
    const [notes, setNotes] = useState('');

    React.useEffect(() => {
        if (activity) {
        setType(activity.type || 'breastfeed');
        setTimestamp(activity.timestamp ? format(new Date(activity.timestamp), "yyyy-MM-dd'T'HH:mm") : '');
        setDurationMinutes(activity.duration_minutes || 0);
        setBreastSide(activity.breast_side || 'left');
        setAmountOz(activity.amount_oz || '');
        setNotes(activity.notes || '');
        }
    }, [activity]);

    const handleSave = () => {
        onSave({
        ...activity,
        type,
        timestamp: new Date(timestamp).toISOString(),
        duration_minutes: parseInt(durationMinutes),
        breast_side: type === 'breastfeed' ? breastSide : undefined,
        amount_oz: type === 'bottle' ? parseFloat(amountOz) : undefined,
        notes
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle className="text-[#4A4458]">Edit Baby Activity</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
            <div>
                <Label className="text-[#4A4458]">Activity Type</Label>
                <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="breastfeed">Breastfeeding</SelectItem>
                    <SelectItem value="bottle">Bottle</SelectItem>
                    <SelectItem value="nap">Nap</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="timestamp" className="text-[#4A4458]">Date & Time</Label>
                <Input
                id="timestamp"
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="rounded-xl mt-1"
                />
            </div>

            <div>
                <Label htmlFor="duration" className="text-[#4A4458]">Duration (minutes)</Label>
                <Input
                id="duration"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="rounded-xl mt-1"
                />
            </div>

            {type === 'breastfeed' && (
                <div>
                <Label className="text-[#4A4458]">Breast Side</Label>
                <Select value={breastSide} onValueChange={setBreastSide}>
                    <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            )}

            {type === 'bottle' && (
                <div>
                <Label htmlFor="amount" className="text-[#4A4458]">Amount (oz)</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.5"
                    value={amountOz}
                    onChange={(e) => setAmountOz(e.target.value)}
                    className="rounded-xl mt-1"
                />
                </div>
            )}

            <div>
                <Label htmlFor="notes" className="text-[#4A4458]">Notes</Label>
                <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl mt-1"
                rows={3}
                />
            </div>

            <div className="flex gap-2 pt-2">
                <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="flex-1"
                >
                Cancel
                </Button>
                <Button
                onClick={handleSave}
                className="flex-1 bg-[#8B7A9F] hover:bg-[#7A6A8E]"
                >
                Save Changes
                </Button>
            </div>
            </div>
        </DialogContent>
        </Dialog>
    );
    }