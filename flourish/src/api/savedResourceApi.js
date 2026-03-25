import {
    createEntity,
    deleteEntity,
    getEntity,
    listEntities,
    updateEntity,
} from './entityClient';

const ENTITY = 'SavedResource';

export function listSavedResources(options) {
    return listEntities(ENTITY, options);
}

export function getSavedResource(id) {
    return getEntity(ENTITY, id);
}

export function createSavedResource(data) {
    return createEntity(ENTITY, data);
}

export function updateSavedResource(id, data) {
    return updateEntity(ENTITY, id, data);
}

export function deleteSavedResource(id) {
    return deleteEntity(ENTITY, id);
}
