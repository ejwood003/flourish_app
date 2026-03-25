import {
    createEntity,
    deleteEntity,
    getEntity,
    listEntities,
    updateEntity,
} from './entityClient';

const ENTITY = 'BabyProfile';

export function listBabyProfiles(options) {
    return listEntities(ENTITY, options);
}

export function getBabyProfile(id) {
    return getEntity(ENTITY, id);
}

export function createBabyProfile(data) {
    return createEntity(ENTITY, data);
}

export function updateBabyProfile(id, data) {
    return updateEntity(ENTITY, id, data);
}

export function deleteBabyProfile(id) {
    return deleteEntity(ENTITY, id);
}
