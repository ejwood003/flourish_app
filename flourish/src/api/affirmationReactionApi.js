import {
    createEntity,
    deleteEntity,
    getEntity,
    listEntities,
    updateEntity,
} from './entityClient';

const ENTITY = 'AffirmationReaction';

export function listAffirmationReactions(options) {
    return listEntities(ENTITY, options);
}

export function getAffirmationReaction(id) {
    return getEntity(ENTITY, id);
}

export function createAffirmationReaction(data) {
    return createEntity(ENTITY, data);
}

export function updateAffirmationReaction(id, data) {
    return updateEntity(ENTITY, id, data);
}

export function deleteAffirmationReaction(id) {
    return deleteEntity(ENTITY, id);
}
