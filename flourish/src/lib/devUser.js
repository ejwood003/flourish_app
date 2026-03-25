/** Matches `DevUserSeed.DevUserId` in the backend. */
export const DEV_SEED_USER_ID = '11111111-1111-1111-1111-111111111111';

export function profilePrimaryKey(p) {
    return p?.user_id ?? p?.userId ?? '';
}

/** Same logic as Home: prefer dev seed user, else first profile when sorted by id. */
export function pickPrimaryUserProfile(profiles) {
    if (!Array.isArray(profiles) || profiles.length === 0) return undefined;
    return (
        profiles.find(
            (p) => profilePrimaryKey(p).toLowerCase() === DEV_SEED_USER_ID,
        ) ??
        [...profiles].sort((a, b) =>
            profilePrimaryKey(a).localeCompare(profilePrimaryKey(b)),
        )[0]
    );
}
