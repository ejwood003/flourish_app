import {
    createEntity,
    deleteEntity,
    getEntity,
    listEntities,
    updateEntity,
} from './entityClient';

const ENTITY = 'JournalEntry';

export function listJournalEntries(options) {
    return listEntities(ENTITY, options);
}

export function getJournalEntry(id) {
    return getEntity(ENTITY, id);
}

export function createJournalEntry(data) {
    return createEntity(ENTITY, data);
}

export function updateJournalEntry(id, data) {
    return updateEntity(ENTITY, id, data);
}

export function deleteJournalEntry(id) {
    return deleteEntity(ENTITY, id);
}
