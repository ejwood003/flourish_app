# Backend: profile settings (implemented)

This matches the **Profile** page in `flourish` (Settings tab auto-save + Personal tab save) and **Onboarding** `UserProfile.create` payloads.

## API behavior

### `PATCH/PUT .../entities/UserProfile/{id}` (partial update)

- The controller applies **only keys present** in the JSON body. Omitted keys are left unchanged (last-write-wins per field across requests).
- `id` and `created_date` are ignored in the body.
- JSON `null` on a **nullable** property clears it. JSON `null` on a **non-nullable value type** (e.g. `bool`) is skipped so the field is not overwritten.
- JSON `null` for a **list** field (`List<string>`) is stored as an **empty list** (valid JSON arrays in SQLite for list columns).

### `POST .../entities/UserProfile` (create)

- After deserialization, `UserProfile.EnsureDefaults()` runs so partial bodies still get safe defaults for `HomeFeatures`, notification time lists, and `SupportName` when missing or null.

## `UserProfile` fields (snake_case in JSON)

| JSON (snake_case) | CLR property | Notes |
| --- | --- | --- |
| `created_by` | `CreatedBy` | Optional; partner linking / onboarding filters |
| `username` | `Username` | |
| `phone_number` | `PhoneNumber` | |
| `date_of_birth` | `DateOfBirth` | ISO date string (e.g. `yyyy-MM-dd`) |
| `baby_full_name` | `BabyFullName` | |
| `baby_date_of_birth` | `BabyDateOfBirth` | |
| `baby_gender` | `BabyGender` | |
| `support_type` | `SupportType` | |
| `support_name` | `SupportName` | Default `"your partner"` |
| `support_email` | `SupportEmail` | Used by `UserProfile.filter({ support_email })` |
| `support_phone` | `SupportPhone` | |
| `share_journals` | `ShareJournals` | bool |
| `share_mood` | `ShareMood` | bool |
| `share_baby_tracking` | `ShareBabyTracking` | bool |
| `notifications_mood_enabled` | `NotificationsMoodEnabled` | bool; model default `true` |
| `notifications_mood_times` | `NotificationsMoodTimes` | `string[]` → JSON in DB |
| `notifications_feeding_enabled` | `NotificationsFeedingEnabled` | bool |
| `notifications_feeding_times` | `NotificationsFeedingTimes` | `string[]` |
| `notifications_nap_enabled` | `NotificationsNapEnabled` | bool |
| `notifications_nap_times` | `NotificationsNapTimes` | `string[]` |
| `home_features` | `HomeFeatures` | Ordered widget ids |

List columns (`HomeFeatures`, `NotificationsMoodTimes`, etc.) are stored as JSON text via EF value converters in `FlourishDbContext`.

## Migrations

Apply after pull:

```bash
cd backend/flourishbackend/flourishbackend
dotnet ef database update
```

Migration `UserProfileSettingsFields` adds the new `UserProfiles` columns and (if missing from an older DB) creates `JournalEntries` and `SavedResources` to align the schema with `FlourishDbContext`.

## Frontend alignment

| Area | Behavior |
| --- | --- |
| **Settings tab** | Calls `UserProfile.update(id, partial)` per change (`handleSettingsPersist` in `Profile.jsx`). |
| **Personal tab** | Saves full draft via `UserProfile.update` or `create` (`handlePersonalSave`). |
| **Home** | Reads `home_features` from `UserProfile.list()` for layout/order. |

## Optional follow-up

- Onboarding can set `created_by` when creating the mother’s profile so partner verification (`support_email` + `created_by`) can match; the column exists server-side.
