/** Normalizes REST (.NET snake_case) baby activity rows. */

export function babyActivityId(a) {
    if (!a) return undefined;
    return a.baby_activity_id ?? a.BabyActivityId ?? a.id;
}

export function babyActivityTimestamp(a) {
    if (!a) return undefined;
    return a.timestamp ?? a.Timestamp;
}

/**
 * Parse API timestamp to a Date in the user's local zone for display.
 * .NET System.Text.Json often emits UTC instants without a trailing Z (Kind=Unspecified);
 * ECMAScript treats those as *local* wall time, which shifts times (e.g. 1:22 PM MST → 7–8 PM).
 * If the string is an ISO datetime without an explicit offset, interpret it as UTC by appending Z.
 */
export function parseBabyActivityTimestampToDate(raw) {
    if (raw == null || raw === '') return null;
    const s = String(raw).trim();
    if (!s) return null;
    const hasExplicitZone = /Z$/i.test(s) || /[+-]\d{2}:\d{2}(:\d{2})?$/.test(s);
    if (/^\d{4}-\d{2}-\d{2}T/.test(s) && !hasExplicitZone) {
        const d = new Date(`${s}Z`);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
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
