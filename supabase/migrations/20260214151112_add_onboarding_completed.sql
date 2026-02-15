-- Add missing columns to employers table for onboarding flow
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS notify_deadlines boolean DEFAULT true;
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS notify_updates boolean DEFAULT true;
