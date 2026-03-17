-- Flourish backend: base44-compatible entity tables
-- Each table stores id, created_date, and a jsonb "data" column for the rest of the entity.

-- Map entity names (from frontend/SDK) to table names
-- UserProfile -> user_profile, MoodEntry -> mood_entry, etc.

CREATE TABLE IF NOT EXISTS user_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS mood_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS baby_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS baby_mood (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS journal_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS custom_affirmation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS affirmation_reaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS support_request (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS selected_support_request (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS saved_resource (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'
);

-- Stub for User/me (auth); frontend uses requiresAuth: false but SDK still may call /entities/User/me
CREATE TABLE IF NOT EXISTS "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'
);

-- Public settings: keyed by app_id for multi-tenant
CREATE TABLE IF NOT EXISTS public_settings (
  app_id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'
);

-- Indexes for common sorts and filters
CREATE INDEX IF NOT EXISTS idx_mood_entry_date ON mood_entry ((data->>'date'));
CREATE INDEX IF NOT EXISTS idx_mood_entry_created ON mood_entry (created_date DESC);
CREATE INDEX IF NOT EXISTS idx_baby_activity_timestamp ON baby_activity ((data->>'timestamp'));
CREATE INDEX IF NOT EXISTS idx_baby_mood_timestamp ON baby_mood ((data->>'timestamp'));
CREATE INDEX IF NOT EXISTS idx_journal_entry_created ON journal_entry (created_date DESC);
CREATE INDEX IF NOT EXISTS idx_custom_affirmation_created ON custom_affirmation (created_date DESC);
CREATE INDEX IF NOT EXISTS idx_selected_support_request_date ON selected_support_request ((data->>'selected_date'));
CREATE INDEX IF NOT EXISTS idx_saved_resource_created ON saved_resource (created_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_profile_support_email ON user_profile ((data->>'support_email'));
