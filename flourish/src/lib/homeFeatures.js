/** Insert `featureId` into `currentOrder` so it sits before the first item that comes after it in `defaults`. */
export function insertFeatureInDefaultSlot(currentOrder, featureId, defaults = DEFAULT_HOME_FEATURES) {
    const rank = defaults.indexOf(featureId);
    if (rank === -1) return [...currentOrder, featureId];
    let insertAt = currentOrder.length;
    for (let i = 0; i < currentOrder.length; i++) {
        const r = defaults.indexOf(currentOrder[i]);
        if (r > rank) {
            insertAt = i;
            break;
        }
    }
    const next = [...currentOrder];
    next.splice(insertAt, 0, featureId);
    return next;
}

/** Canonical home card order (matches backend `UserProfile.HomeFeatures` default). */
export const DEFAULT_HOME_FEATURES = [
    'affirmation',
    'mood',
    'mood_chips',
    'mindfulness',
    'tasks',
    'baby',
    'support',
    'breathing',
    'journal',
    'meditations',
    'articles',
];

function setsEqualAsMultiset(a, b) {
    if (a.length !== b.length) return false;
    const counts = new Map();
    for (const x of a) counts.set(x, (counts.get(x) ?? 0) + 1);
    for (const x of b) {
        const n = counts.get(x);
        if (n == null || n === 0) return false;
        counts.set(x, n - 1);
    }
    return true;
}

/**
 * Detects the old `mergeHomeFeaturesWithDefaults` shape: partial DB order first, then the rest
 * of the defaults in canonical order. That should display as full canonical order instead.
 */
function wasLegacyAppendMerge(cleaned, defaults) {
    if (cleaned.length !== defaults.length) return false;
    for (let k = 1; k < cleaned.length; k++) {
        const prefix = cleaned.slice(0, k);
        const prefixSet = new Set(prefix);
        if (prefix.length !== prefixSet.size) continue;
        const suffixExpected = defaults.filter((id) => !prefixSet.has(id));
        const suffixActual = cleaned.slice(k);
        if (
            suffixActual.length === suffixExpected.length &&
            suffixActual.every((id, i) => id === suffixExpected[i])
        ) {
            return true;
        }
    }
    return false;
}

/**
 * Valid unique feature ids from API order (unknown entries dropped).
 * @param {unknown} raw
 * @param {string[]} [defaults]
 * @returns {string[]}
 */
export function sanitizeHomeFeatureIds(raw, defaults = DEFAULT_HOME_FEATURES) {
    if (!raw || !Array.isArray(raw)) {
        return [];
    }
    const allowed = new Set(defaults);
    const seen = new Set();
    const cleaned = [];
    for (const id of raw) {
        if (typeof id === 'string' && allowed.has(id) && !seen.has(id)) {
            cleaned.push(id);
            seen.add(id);
        }
    }
    return cleaned;
}

/** Stored list is too short to represent a real “pick which cards” choice — usually corrupt / legacy SQLite. */
export function isIncompleteStoredHomeFeatures(cleaned, defaults = DEFAULT_HOME_FEATURES) {
    return (
        cleaned.length > 0 &&
        cleaned.length < defaults.length &&
        cleaned.length < 3
    );
}

/**
 * @param {unknown} raw - `home_features` from API
 * @param {string[]} defaults - usually `DEFAULT_HOME_FEATURES`
 * @returns {string[]}
 */
export function resolveHomeFeatureOrder(raw, defaults = DEFAULT_HOME_FEATURES) {
    const cleaned = sanitizeHomeFeatureIds(raw, defaults);
    if (cleaned.length === 0) {
        return [...defaults];
    }

    // All features on: keep saved order (user drag-drop in HomeCustomization).
    if (cleaned.length === defaults.length && setsEqualAsMultiset(cleaned, defaults)) {
        if (wasLegacyAppendMerge(cleaned, defaults)) {
            return [...defaults];
        }
        return cleaned;
    }

    // 1–2 ids while we expect ~11: treat as bad data, show full home (avoids flash → mood+journal only).
    if (isIncompleteStoredHomeFeatures(cleaned, defaults)) {
        return [...defaults];
    }

    // Subset (user turned some off): canonical order among enabled ids only.
    const seen = new Set(cleaned);
    return defaults.filter((id) => seen.has(id));
}
