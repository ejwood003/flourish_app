/** Normalizes REST (.NET snake_case) and legacy Base44-shaped journal rows. */

export function journalEntryId(entry) {
    if (!entry) return undefined;
    return entry.journal_entry_id ?? entry.JournalEntryId ?? entry.id;
}

/**
 * Parse API / SQLite datetime strings for display.
 * SQLite often stores "YYYY-MM-DD HH:mm:ss" (space, no timezone) — some engines parse that poorly without normalization.
 */
function parseApiDateTime(raw) {
    if (raw == null || raw === '') return null;
    if (raw instanceof Date) {
        return Number.isNaN(raw.getTime()) ? null : raw;
    }
    const s = String(raw).trim();
    if (!s) return null;

    // ISO-like with space instead of T (common SQLite TEXT datetime)
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) {
        const normalized = s.replace(' ', 'T');
        const d = new Date(normalized);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
}

export function journalEntryCreatedAt(entry) {
    const raw =
        entry?.created_date ??
        entry?.CreatedDate ??
        entry?.created_at ??
        entry?.createdDate;
    return parseApiDateTime(raw);
}
