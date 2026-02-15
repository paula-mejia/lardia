-- Add missing columns to newsletter_subscribers table
-- Run this migration via Supabase Dashboard > SQL Editor

ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS lgpd_consent_at timestamptz;

-- Update existing rows to have status based on unsubscribed_at
UPDATE newsletter_subscribers SET status = 'unsubscribed' WHERE unsubscribed_at IS NOT NULL;
UPDATE newsletter_subscribers SET status = 'active' WHERE unsubscribed_at IS NULL;

-- Clean up test data
DELETE FROM newsletter_subscribers WHERE email = 'test@test.com';
