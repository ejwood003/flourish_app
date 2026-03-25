/** Normalizes REST (.NET snake_case) baby activity rows. */

export function babyActivityId(a) {
    if (!a) return undefined;
    return a.baby_activity_id ?? a.BabyActivityId ?? a.id;
}

export function babyActivityTimestamp(a) {
    if (!a) return undefined;
    return a.timestamp ?? a.Timestamp;
}

export function babyActivityType(a) {
    if (!a) return '';
    const t = a.type ?? a.Type ?? '';
    return typeof t === 'string' ? t.toLowerCase() : '';
}

export function babyActivityDurationMinutes(a) {
    if (!a) return 0;
    const n = a.duration_minutes ?? a.DurationMinutes;
    return typeof n === 'number' && !Number.isNaN(n) ? n : 0;
}

/** BabyMood rows use the same timestamp / mood_value shapes as the REST API. */
export function babyMoodValue(bm) {
    if (!bm) return 0;
    const v = bm.mood_value ?? bm.MoodValue;
    return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
}

export function babyMoodTags(bm) {
    if (!bm) return [];
    const tags = bm.tags ?? bm.Tags;
    return Array.isArray(tags) ? tags : [];
}
