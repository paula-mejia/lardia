-- Add eSocial integration fields to employers table
ALTER TABLE employers
  ADD COLUMN IF NOT EXISTS esocial_connected boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS esocial_connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS esocial_cpf text,
  ADD COLUMN IF NOT EXISTS gov_br_verified boolean DEFAULT false;
