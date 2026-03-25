import {
    createEntity,
    deleteEntity,
    getEntity,
    listEntities,
    updateEntity,
} from './entityClient';

const ENTITY = 'SupportProfile';

export function listSupportProfiles(options) {
    return listEntities(ENTITY, options);
}

export function getSupportProfile(id) {
    return getEntity(ENTITY, id);
}

export function createSupportProfile(data) {
    return createEntity(ENTITY, data);
}

export function updateSupportProfile(id, data) {
    return updateEntity(ENTITY, id, data);
}

export function deleteSupportProfile(id) {
    return deleteEntity(ENTITY, id);
}
