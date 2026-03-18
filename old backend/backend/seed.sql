-- Seed data for Flourish backend tables
-- Run after schema: psql $DATABASE_URL -f seed.sql  (or npm run db:seed)

-- Public settings (use your app_id or leave as your_app_id)
INSERT INTO public_settings (app_id, data) VALUES
  ('your_app_id', '{"requires_auth": false}')
ON CONFLICT (app_id) DO UPDATE SET data = EXCLUDED.data;

-- User stub for /entities/User/me
INSERT INTO "user" (id, data) VALUES
  ('a0000000-0000-0000-0000-000000000001', '{"email": "demo@example.com"}')
ON CONFLICT (id) DO NOTHING;

-- UserProfile: one main profile so Home has a profile and enabled features
INSERT INTO user_profile (id, data) VALUES
  ('b0000000-0000-0000-0000-000000000001', '{
    "username": "Demo User",
    "support_type": "partner",
    "support_name": "Partner",
    "home_features": ["affirmation", "mood", "mood_chips", "baby", "mindfulness", "support", "tasks", "breathing", "journal", "meditations", "articles"],
    "share_journals": true,
    "share_mood": true,
    "share_baby_tracking": true
  }'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- MoodEntry: sample mood check-ins (date as YYYY-MM-DD)
INSERT INTO mood_entry (id, created_date, data) VALUES
  (gen_random_uuid(), now() - interval '1 day', '{"mood_value": 75, "date": "2025-02-20"}'::jsonb),
  (gen_random_uuid(), now(), '{"mood_value": 60, "date": "2025-02-21"}'::jsonb);

-- JournalEntry: sample journal entries
INSERT INTO journal_entry (id, created_date, data) VALUES
  (gen_random_uuid(), now() - interval '2 days', '{"content": "Today I felt grateful for a quiet morning.", "prompt": "What small moment do I want to remember?", "share_with_partner": true}'::jsonb),
  (gen_random_uuid(), now() - interval '1 day', '{"content": "Baby smiled for the first time today.", "prompt": "What made me smile today?", "share_with_partner": true}'::jsonb);

-- CustomAffirmation: default-style affirmations
INSERT INTO custom_affirmation (id, created_date, data) VALUES
  (gen_random_uuid(), now(), '{"text": "I am exactly who my baby needs.", "is_favorite": false}'::jsonb),
  (gen_random_uuid(), now(), '{"text": "Rest is productive right now.", "is_favorite": false}'::jsonb),
  (gen_random_uuid(), now(), '{"text": "My best is enough today.", "is_favorite": false}'::jsonb);

-- SupportRequest: sample support options
INSERT INTO support_request (id, data) VALUES
  (gen_random_uuid(), '{"request_text": "Bring me water", "is_custom": false}'::jsonb),
  (gen_random_uuid(), '{"request_text": "Take the baby", "is_custom": false}'::jsonb);

-- SelectedSupportRequest: one for today
INSERT INTO selected_support_request (id, data) VALUES
  (gen_random_uuid(), '{"request_text": "Bring me water", "selected_date": "2025-02-21"}'::jsonb);

-- BabyActivity: sample feeding and nap
INSERT INTO baby_activity (id, created_date, data) VALUES
  (gen_random_uuid(), now() - interval '2 hours', '{"type": "breastfeed", "timestamp": "2025-02-21T12:00:00.000Z"}'::jsonb),
  (gen_random_uuid(), now() - interval '1 hour', '{"type": "nap", "timestamp": "2025-02-21T13:00:00.000Z", "duration_minutes": 45}'::jsonb);

-- BabyMood: one sample
INSERT INTO baby_mood (id, created_date, data) VALUES
  (gen_random_uuid(), now(), '{"mood_value": 80, "timestamp": "2025-02-21T14:00:00.000Z"}'::jsonb);

-- SavedResource: sample saved tip
INSERT INTO saved_resource (id, created_date, data) VALUES
  (gen_random_uuid(), now(), '{"resource_id": "tip1", "resource_type": "tip"}'::jsonb);
