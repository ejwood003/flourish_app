import { createEntity, deleteEntity, listEntities, updateEntity } from './entityClient';

const ENTITY = 'MoodEntry';

export function createMoodEntry(data) {
    return createEntity(ENTITY, data);
}

export function getMoodEntries(options) {
    return listEntities(ENTITY, options ?? {});
}

export function getMoodEntriesByUser(userId) {
    return listEntities(ENTITY, { filter: { user_id: userId } });
}

export function deleteMoodEntry(id) {
    return deleteEntity(ENTITY, id);
}

export function updateMoodEntry(id, data) {
    return updateEntity(ENTITY, id, data);
}
