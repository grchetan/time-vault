-- Run this in Supabase SQL Editor
-- Creates the future_mails table with security policies and soft-delete support

CREATE TABLE IF NOT EXISTS future_mails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  deliver_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at BIGINT,
  -- Trash & Recovery system columns (soft-delete)
  deleted_at BIGINT DEFAULT NULL,
  trash_expires_at BIGINT DEFAULT NULL
);

ALTER TABLE future_mails ENABLE ROW LEVEL SECURITY;

-- Users can only see their own active (non-deleted) letters
CREATE POLICY "select_own_mails" ON future_mails
FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND deleted_at IS NULL);

-- Users can only create letters for themselves
CREATE POLICY "insert_own_mails" ON future_mails
FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- NOTE: Edge functions use service_role key which bypasses RLS entirely.
-- The DELETE and UPDATE policies below apply only to direct client requests.

-- Users can only delete their own letters (hard delete, direct client)
CREATE POLICY "delete_own_mails" ON future_mails
FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ─── MIGRATION: Add soft-delete columns if table already exists ────────────
-- Run this if you already have a future_mails table without the trash columns:
-- ALTER TABLE future_mails ADD COLUMN IF NOT EXISTS deleted_at BIGINT DEFAULT NULL;
-- ALTER TABLE future_mails ADD COLUMN IF NOT EXISTS trash_expires_at BIGINT DEFAULT NULL;
