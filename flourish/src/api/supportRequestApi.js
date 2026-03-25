import {
    createEntity,
    deleteEntity,
    getEntity,
    listEntities,
    updateEntity,
} from './entityClient';

const ENTITY = 'SupportRequest';

export function listSupportRequests(options) {
    return listEntities(ENTITY, options);
}

export function getSupportRequest(id) {
    return getEntity(ENTITY, id);
}

export function createSupportRequest(data) {
    return createEntity(ENTITY, data);
}

export function updateSupportRequest(id, data) {
    return updateEntity(ENTITY, id, data);
}

export function deleteSupportRequest(id) {
    return deleteEntity(ENTITY, id);
}
