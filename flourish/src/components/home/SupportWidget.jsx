import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, X, Heart, Sparkles } from 'lucide-react';

const SUGGESTION_CATEGORIES = [
{
title: 'Physical Care',
items: ['Bring me water', 'Make me a snack', 'Refill my bottle', 'Bring a warm drink', 'Set up my pump', 'Run a bath', 'Grab my meds', 'Make lunch']
},
{
title: 'Baby Help',
items: ['Take the baby', 'Change the diaper', 'Handle next feeding', 'Do bedtime routine', 'Rock baby to sleep', 'Do tummy time', 'Go for a walk', 'Burp the baby']
},
{
title: 'Rest Support',
items: ['Let me nap', 'Watch the monitor', 'Take night shift', 'Early morning duty', 'Quiet the house']
},
{
title: 'Emotional Support',
items: ['Sit with me', 'Give me a hug', 'Ask how I\'m feeling', 'Listen for 5 minutes', 'Tell me I\'m doing well', 'Remind me I\'m enough', 'Stay close']
},
{
title: 'Household Relief',
items: ['Do the dishes', 'Start laundry', 'Fold clothes', 'Clean kitchen', 'Take out trash', 'Order dinner', 'Grocery pickup']
},
{
title: 'Nervous System Support',
items: ['Do breathing with me', 'Step outside together', 'Short walk together', 'Make tea & sit', 'Five-minute reset']
},
{
title: 'Micro-Gestures',
items: ['Write me a note', 'Send encouragement', 'Text me something kind', 'Say thank you', 'Hold my hand']
}
];

export default function SupportWidget() {
const queryClient = useQueryClient();
const [showCustomInput, setShowCustomInput] = useState(false);
const [showSuggestions, setShowSuggestions] = useState(false);
const [customRequest, setCustomRequest] = useState('');
const [selectedSuggestions, setSelectedSuggestions] = useState([]);

const { data: profile } = useQuery({
queryKey: ['userProfiles'],
queryFn: () => base44.entities.UserProfile.list().then(p => p[0]),
});

const { data: requests = [] } = useQuery({
queryKey: ['supportRequests'],
queryFn: () => base44.entities.SupportRequest.list(),
});

const createRequestMutation = useMutation({
mutationFn: (data) => base44.entities.SupportRequest.create(data),
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['supportRequests'] });
    setCustomRequest('');
    setShowCustomInput(false);
},
});

const deleteRequestMutation = useMutation({
mutationFn: (id) => base44.entities.SupportRequest.delete(id),
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['supportRequests'] });
},
});

const allRequests = requests;

const handleAddCustom = () => {
if (customRequest.trim()) {
    createRequestMutation.mutate({
    request_text: customRequest.trim(),
    is_custom: true
    });
}
};

const toggleSuggestionSelection = (suggestionText) => {
// Check if this is already a saved request
const isExisting = allRequests.some(r => r.request_text === suggestionText);

if (isExisting) {
    // If it's existing, allow toggle/deselect by deleting
    const existingRequest = allRequests.find(r => r.request_text === suggestionText);
    if (existingRequest) {
    deleteRequestMutation.mutate(existingRequest.id);
    }
} else {
    // If it's new, toggle in the modal selection
    setSelectedSuggestions(prev => 
    prev.includes(suggestionText)
        ? prev.filter(s => s !== suggestionText)
        : [...prev, suggestionText]
    );
}
};

const handleAddSelectedSuggestions = () => {
selectedSuggestions.forEach(suggestionText => {
    createRequestMutation.mutate({
    request_text: suggestionText,
    is_custom: false
    });
});
setSelectedSuggestions([]);
setShowSuggestions(false);
};

const partnerName = profile?.support_name || 'your partner';

const { data: selectedRequestsData = [] } = useQuery({
queryKey: ['selectedSupportRequests'],
queryFn: () => base44.entities.SelectedSupportRequest.filter({
    selected_date: new Date().toISOString().split('T')[0]
}),
});

const selectRequestMutation = useMutation({
mutationFn: (requestText) => base44.entities.SelectedSupportRequest.create({
    request_text: requestText,
    selected_date: new Date().toISOString().split('T')[0]
}),
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['selectedSupportRequests'] });
},
});

const deselectRequestMutation = useMutation({
mutationFn: (id) => base44.entities.SelectedSupportRequest.delete(id),
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['selectedSupportRequests'] });
},
});

return (
<div className="bg-white rounded-3xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
    <Heart className="w-5 h-5 text-[#C9B6CC]" />
    <p className="text-xs font-medium text-[#5F5670] uppercase tracking-wide">
        Support
    </p>
    </div>

    <p className="text-[#4A4458] font-medium mb-4">
    How can {partnerName} support you today?
    </p>

    <div className="grid grid-cols-2 gap-2 mb-4">
    {allRequests.map((request) => (
        <div key={request.id} className="relative group">
        <div className="w-full p-3 rounded-xl text-sm bg-[#DCEAF0] text-[#3F4A57] font-medium">
            {request.request_text}
        </div>
        <button
            type="button"
            onClick={() => deleteRequestMutation.mutate(request.id)}
            className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Delete request: ${request.request_text}`}
        >
            <X className="w-3 h-3 text-[#5F5670]" />
        </button>
        </div>
    ))}
    </div>

    {showCustomInput ? (
    <div className="flex gap-2 mb-3">
        <Input
        placeholder="Type your request..."
        value={customRequest}
        onChange={(e) => setCustomRequest(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
        className="border-[#D9DDEA] text-[#4A4458] placeholder:text-[#8A8396]"
        />
        <Button
        onClick={handleAddCustom}
        disabled={!customRequest.trim()}
        className="bg-[#7D6F99] hover:bg-[#6F618A] text-white"
        >
        Add
        </Button>
    </div>
    ) : null}

    <div className="grid grid-cols-2 gap-2">
    <Button
        type="button"
        onClick={() => setShowCustomInput(true)}
        variant="outline"
        className="border-[#D9DDEA] text-[#5F5670] hover:bg-[#F3F7FA] hover:text-[#4A4458]"
    >
        <Plus className="w-4 h-4 mr-2" />
        Custom
    </Button>

    <Button
        type="button"
        onClick={() => setShowSuggestions(true)}
        variant="outline"
        className="border-[#D9DDEA] text-[#5F5670] hover:bg-[#F3F7FA] hover:text-[#4A4458]"
    >
        <Sparkles className="w-4 h-4 mr-2" />
        Suggestions
    </Button>
    </div>

    <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
    <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
        <DialogTitle className="text-[#4A4458]">Support Suggestions</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4 overflow-y-auto flex-1">
        {SUGGESTION_CATEGORIES.map((category, catIndex) => (
            <div key={catIndex}>
            <h3 className="font-semibold text-[#4A4458] mb-3">{category.title}</h3>
            <div className="grid grid-cols-1 gap-2">
                {category.items.map((item, itemIndex) => {
                const alreadyExists = allRequests.some(r => r.request_text === item);
                const isSelectedInModal = selectedSuggestions.includes(item);

                return (
                    <button
                    key={itemIndex}
                    type="button"
                    onClick={() => toggleSuggestionSelection(item)}
                    className={`p-3 rounded-xl text-sm text-left font-medium transition-all ${
                        alreadyExists
                        ? 'bg-[#DCEAF0] text-[#3F4A57] hover:bg-[#D3E4EB]'
                        : isSelectedInModal
                        ? 'bg-[#CFE0E8] text-[#3F4A57] shadow-sm hover:bg-[#C5D8E1]'
                        : 'bg-[#F8F6FB] text-[#4A4458] hover:bg-[#EEF4F7]'
                    }`}
                    >
                    {item}
                    </button>
                );
                })}
            </div>
            </div>
        ))}
        </div>

        <div className="mt-4 pt-4 border-t border-[#E8E4F3]">
        <Button
            type="button"
            onClick={handleAddSelectedSuggestions}
            disabled={selectedSuggestions.length === 0}
            className="w-full bg-[#7D6F99] hover:bg-[#6F618A] text-white"
        >
            Add Selected ({selectedSuggestions.length})
        </Button>
        </div>
    </DialogContent>
    </Dialog>
</div>
);
}  