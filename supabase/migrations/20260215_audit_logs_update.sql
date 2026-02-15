-- Migration: Add missing columns to audit_logs table
-- Run this in the Supabase SQL Editor

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resource text;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- If the table doesn't exist at all, create it:
-- CREATE TABLE IF NOT EXISTS audit_logs (
--   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id uuid,
--   employer_id uuid,
--   action text NOT NULL,
--   resource text,
--   ip_address text,
--   user_agent text,
--   details jsonb DEFAULT '{}',
--   metadata jsonb DEFAULT '{}',
--   created_at timestamptz DEFAULT now()
-- );
