# Backend notes: profile settings (partial save)

This document describes what the backend should support for the profile **Settings** tab auto-save behavior on the current branch. The frontend teammate implements immediate persistence when users change toggles, notification times, sharing options, or home feature order.

## API contract

### `UserProfile.update(id, body)`

- **`body` must be treated as a partial update (merge / patch).** Only fields present in `body` are changed. Omitted fields must **not** be cleared or overwritten with null unless the client explicitly sends null for that key.
- This matches the frontend calling `UserProfile.update` with a **small object per interaction** (for example only `{ notifications_mood_enabled: false }`), not the full profile document every time.

### `UserProfile.create(body)` (no profile row yet)

- Used from the Personal Info tab when the user saves and there is no existing profile id, with **full** draft profile data from the client.
- If the first write ever comes from the Settings tab with a partial object, the backend should either merge with defaults or reject with a clear error—coordinate with the team if that edge case matters for your deployment.

## Fields the Settings tab sends (partial payloads)

The client may send **one or more** of these in a single `update` call:

| Field | Type (typical) | Source |
| --- | --- | --- |
| `notifications_mood_enabled` | boolean | Notifications toggles |
| `notifications_mood_times` | string[] (e.g. time strings) | Mood reminder times |
| `notifications_feeding_enabled` | boolean | Notifications toggles |
| `notifications_nap_enabled` | boolean | Notifications toggles |
| `share_journals` | boolean | Sharing toggles |
| `share_mood` | boolean | Sharing toggles |
| `share_baby_tracking` | boolean | Sharing toggles |
| `home_features` | string[] (ordered feature ids) | Home customization toggles and drag-and-drop order |

Ensure these columns/properties exist on `UserProfile` (or equivalent) and that validation allows the shapes above.

## Personal Info tab (unchanged contract for “full save”)

The Personal Info tab still uses **Save** once to persist editable fields (username, dates, baby info, support system, etc.). That flow may call `update` with a **larger** payload or `create` when no profile exists. Partial merge behavior still applies to whatever keys are sent.

## Concurrency

Users can change settings in quick succession. The backend should apply each partial update atomically so rapid successive requests do not drop earlier field changes (last-write-wins per field is usually enough if each request merges into the stored entity).

## Summary for implementation

1. Implement **partial updates** for `UserProfile` on update by id.  
2. Support the settings fields listed above with correct types.  
3. Do **not** require the client to send the full profile on every Settings change.
