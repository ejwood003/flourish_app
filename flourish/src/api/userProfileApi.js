import {
    createEntity,
    deleteEntity,
    getEntity,
    listEntities,
    updateEntity,
} from './entityClient';

const ENTITY = 'UserProfile';

/** Use this key for `listUserProfiles` so Base44 `['userProfiles']` queries cannot clobber REST data. */
export const USER_PROFILES_QUERY_KEY = ['userProfiles', 'rest'];

export function listUserProfiles(options) {
    return listEntities(ENTITY, options);
}

export function getUserProfile(id) {
    return getEntity(ENTITY, id);
}

export function createUserProfile(data) {
    return createEntity(ENTITY, data);
}

export function updateUserProfile(id, data) {
    return updateEntity(ENTITY, id, data);
}

export function deleteUserProfile(id) {
    return deleteEntity(ENTITY, id);
}
