-- Add Stripe subscription fields to employers table
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'none');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE employers
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS subscription_status subscription_status NOT NULL DEFAULT 'none';
