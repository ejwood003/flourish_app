import {
    createEntity,
    deleteEntity,
    getEntity,
    listEntities,
    updateEntity,
} from './entityClient';

const ENTITY = 'Affirmation';

export function listAffirmations(options) {
    return listEntities(ENTITY, options);
}

export function getAffirmation(id) {
    return getEntity(ENTITY, id);
}

export function createAffirmation(data) {
    return createEntity(ENTITY, data);
}

export function updateAffirmation(id, data) {
    return updateEntity(ENTITY, id, data);
}

export function deleteAffirmation(id) {
    return deleteEntity(ENTITY, id);
}
