-- Run this in Supabase SQL Editor
-- Creates the future_mails table with security policies

CREATE TABLE IF NOT EXISTS future_mails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  deliver_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at BIGINT
);

ALTER TABLE future_mails ENABLE ROW LEVEL SECURITY;

-- Users can only see their own letters
CREATE POLICY "select_own_mails" ON future_mails
FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can only create letters for themselves
CREATE POLICY "insert_own_mails" ON future_mails
FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can only delete their own undelivered letters
CREATE POLICY "delete_own_mails" ON future_mails
FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND delivered = false);
