import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Layout, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    DEFAULT_HOME_FEATURES,
    insertFeatureInDefaultSlot,
    resolveHomeFeatureOrder,
} from '@/lib/homeFeatures';

const FEATURE_LABELS = {
    affirmation: 'Daily Affirmation',
    mood: 'Mood Check-In',
    mood_chips: 'Mood Chips',
    baby: 'Baby Quick Actions',
    meditations: 'Meditations',
    breathing: 'Guided Breathing',
    journal: 'Journal',
    support: 'Support',
    tasks: 'Upcoming Tasks',
    articles: 'Recommended Articles',
    mindfulness: 'Mindfulness Hub',
};

const FEATURES = DEFAULT_HOME_FEATURES.map((id) => ({
    id,
    label: FEATURE_LABELS[id] ?? id,
}));

/**
 * @param {object} props
 * @param {object} props.profile
 * @param {function} props.onSavePatch — async (patch) => void
 * @param {boolean} props.isSaving
 * @param {boolean} [props.defaultOpen] — e.g. true on standalone Edit Home page
 */
export default function HomeCustomization({ profile, onSavePatch, isSaving, defaultOpen = false }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(defaultOpen);

    const storedRaw = profile?.home_features ?? profile?.homeFeatures;

    const [enabledFeatures, setEnabledFeatures] = useState(() =>
        resolveHomeFeatureOrder(storedRaw, DEFAULT_HOME_FEATURES),
    );

    const profileKey = profile?.user_id ?? profile?.userId ?? profile?.id ?? '';

    const syncFromProfile = useCallback(() => {
        setEnabledFeatures(resolveHomeFeatureOrder(storedRaw, DEFAULT_HOME_FEATURES));
    }, [storedRaw]);

    useEffect(() => {
        syncFromProfile();
    }, [profileKey, syncFromProfile]);

    const orderedFeatures = useMemo(
        () => [
            ...enabledFeatures.map((id) => FEATURES.find((f) => f.id === id)).filter(Boolean),
            ...FEATURES.filter((f) => !enabledFeatures.includes(f.id)),
        ],
        [enabledFeatures],
    );

    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        const prev = enabledFeatures;
        const items = [...orderedFeatures];
        const [reordered] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reordered);
        const newOrder = items.filter((f) => prev.includes(f.id)).map((f) => f.id);
        setEnabledFeatures(newOrder);
        try {
            await onSavePatch({ home_features: newOrder });
        } catch {
            setEnabledFeatures(prev);
        }
    };

    const toggleFeature = async (featureId) => {
        const prev = enabledFeatures;
        let next;
        if (prev.includes(featureId)) {
            next = prev.filter((id) => id !== featureId);
        } else {
            next = insertFeatureInDefaultSlot(prev, featureId, DEFAULT_HOME_FEATURES);
        }
        setEnabledFeatures(next);
        try {
            await onSavePatch({ home_features: next });
        } catch {
            setEnabledFeatures(prev);
        }
    };

    const enabledCount = enabledFeatures.length;

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between p-5 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E8E4F3] flex items-center justify-center flex-shrink-0">
                        <Layout className="w-4 h-4 text-[#8B7A9F]" />
                    </div>
                    <div>
                        <p className="font-semibold text-[#4A4458]">Home Screen</p>
                        <p className="text-xs text-[#7D7589] mt-0.5">
                            {enabledCount} of {FEATURES.length} features enabled
                        </p>
                    </div>
                </div>
                {open ? (
                    <ChevronUp className="w-4 h-4 text-[#7D7589]" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-[#7D7589]" />
                )}
            </button>

            {open ? (
                <div className="border-t border-[#F5EEF8] px-5 pb-5">
                    <p className="text-xs text-[#7D7589] pt-4 mb-3">Drag to reorder · Toggle to show/hide</p>

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="features">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-2"
                                >
                                    {orderedFeatures.map((feature, index) => {
                                        const isEnabled = enabledFeatures.includes(feature.id);
                                        return (
                                            <Draggable
                                                key={feature.id}
                                                draggableId={feature.id}
                                                index={index}
                                                isDragDisabled={!isEnabled || isSaving}
                                            >
                                                {(dragProvided, snapshot) => (
                                                    <div
                                                        ref={dragProvided.innerRef}
                                                        {...dragProvided.draggableProps}
                                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                                            isEnabled
                                                                ? 'bg-[#F5EEF8]'
                                                                : 'bg-gray-50 opacity-50'
                                                        } ${
                                                            snapshot.isDragging
                                                                ? 'shadow-md ring-1 ring-[#8B7A9F]/20'
                                                                : ''
                                                        }`}
                                                    >
                                                        <div
                                                            {...dragProvided.dragHandleProps}
                                                            className="cursor-grab active:cursor-grabbing"
                                                        >
                                                            <GripVertical
                                                                className={`w-4 h-4 ${
                                                                    isEnabled
                                                                        ? 'text-[#8B7A9F]'
                                                                        : 'text-gray-300'
                                                                }`}
                                                            />
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium text-[#4A4458]">
                                                            {feature.label}
                                                        </span>
                                                        <Switch
                                                            checked={isEnabled}
                                                            disabled={isSaving}
                                                            onCheckedChange={() => toggleFeature(feature.id)}
                                                            className="data-[state=checked]:bg-[#8B7A9F] flex-shrink-0"
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

                    {/* <button
                        type="button"
                        onClick={() => navigate(createPageUrl('PartnerHome'))}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 border border-[#8B7A9F] text-[#8B7A9F] rounded-xl text-sm font-medium hover:bg-[#F5EEF8] transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        Preview Partner Home
                    </button> */}
                </div>
            ) : null}
        </div>
    );
}
