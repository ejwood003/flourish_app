// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { GripVertical, Layout, Eye } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    DEFAULT_HOME_FEATURES,
    insertFeatureInDefaultSlot,
    resolveHomeFeatureOrder,
} from '@/lib/homeFeatures';

const FEATURE_LABELS = {
    affirmation: 'Affirmation',
    mood: 'Mood Check-In',
    mood_chips: 'Mood Chips',
    mindfulness: 'Mindfulness',
    tasks: 'Upcoming Tasks',
    baby: 'Baby Quick Actions',
    support: 'Support',
    breathing: 'Guided Breathing',
    journal: 'Journal',
    meditations: 'Meditations',
    articles: 'Recommended Articles',
};

/** Same order as `DEFAULT_HOME_FEATURES` so the editor matches the home screen default. */
const FEATURES = DEFAULT_HOME_FEATURES.map((id) => ({
    id,
    label: FEATURE_LABELS[id],
}));

export default function HomeCustomization({ profile, onUpdate }) {
const navigate = useNavigate();
const stored = profile?.home_features ?? profile?.homeFeatures;
const enabledFeatures = resolveHomeFeatureOrder(stored, DEFAULT_HOME_FEATURES);

// Get ordered list of enabled features + disabled features at the end
const orderedFeatures = [
...enabledFeatures.map(id => FEATURES.find(f => f.id === id)).filter(Boolean),
...FEATURES.filter(f => !enabledFeatures.includes(f.id))
];

const handleDragEnd = (result) => {
if (!result.destination) return;

const items = [...orderedFeatures];
const [reordered] = items.splice(result.source.index, 1);
items.splice(result.destination.index, 0, reordered);

// Update with only enabled features in new order
const newOrder = items.filter(f => enabledFeatures.includes(f.id)).map(f => f.id);
onUpdate({ home_features: newOrder });
};

const toggleFeature = (featureId) => {
if (enabledFeatures.includes(featureId)) {
    onUpdate({ home_features: enabledFeatures.filter(id => id !== featureId) });
} else {
    onUpdate({
        home_features: insertFeatureInDefaultSlot(
            enabledFeatures,
            featureId,
            DEFAULT_HOME_FEATURES,
        ),
    });
}
};

return (
<div className="bg-white rounded-3xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
    <Layout className="w-5 h-5 text-[#8B7A9F]" />
    <h3 className="text-lg font-semibold text-[#4A4458]">Edit Home Page</h3>
    </div>
    
    <p className="text-sm text-[#5A4B70] mb-4">
    Toggle features and drag to reorder
    </p>

    <DragDropContext onDragEnd={handleDragEnd}>
    <Droppable droppableId="features">
        {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {orderedFeatures.map((feature, index) => {
            const isEnabled = enabledFeatures.includes(feature.id);
            
            return (
                <Draggable 
                key={feature.id} 
                draggableId={feature.id} 
                index={index}
                isDragDisabled={!isEnabled}
                >
                {(provided, snapshot) => (
                    <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isEnabled 
                        ? 'bg-[#F5EEF8]' 
                        : 'bg-gray-50 opacity-50'
                    } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                    >
                    <div {...provided.dragHandleProps}>
                        <GripVertical className={`w-5 h-5 ${isEnabled ? 'text-[#8B7A9F]' : 'text-gray-400'}`} />
                    </div>
                    <Label className="flex-1 text-[#4A4458]">{feature.label}</Label>
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        className="data-[state=checked]:bg-[#8B7A9F]"
                    />
                    </div>
                )}
                </Draggable>
            );
            })}
            {provided.placeholder}
        </div>
        )}
    </Droppable>
    </DragDropContext>

    <Button
    onClick={() => navigate(createPageUrl('PartnerHome'))}
    variant="outline"
    className="w-full mt-6 border-[#8B7A9F] text-[#5A4B70] hover:bg-[#F5EEF8]"
    >
    <Eye className="w-4 h-4 mr-2" />
    Preview Partner Home Screen
    </Button>
</div>
);
}