import {
    createEntity,
    deleteEntity,
    getEntity,
    listEntities,
    updateEntity,
} from './entityClient';

const ENTITY = 'BabyActivity';

export function listBabyActivities(options) {
    return listEntities(ENTITY, options);
}

export function getBabyActivity(id) {
    return getEntity(ENTITY, id);
}

export function createBabyActivity(data) {
    return createEntity(ENTITY, data);
}

export function updateBabyActivity(id, data) {
    return updateEntity(ENTITY, id, data);
}

export function deleteBabyActivity(id) {
    return deleteEntity(ENTITY, id);
}
