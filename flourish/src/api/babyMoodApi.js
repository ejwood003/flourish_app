import {
    createEntity,
    deleteEntity,
    getEntity,
    listEntities,
    updateEntity,
} from './entityClient';

const ENTITY = 'BabyMood';

export function listBabyMoods(options) {
    return listEntities(ENTITY, options);
}

export function getBabyMood(id) {
    return getEntity(ENTITY, id);
}

export function createBabyMood(data) {
    return createEntity(ENTITY, data);
}

export function updateBabyMood(id, data) {
    return updateEntity(ENTITY, id, data);
}

export function deleteBabyMood(id) {
    return deleteEntity(ENTITY, id);
}
