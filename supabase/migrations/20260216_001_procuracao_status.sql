-- Add procuracao_status column to employers table
ALTER TABLE employers
ADD COLUMN IF NOT EXISTS procuracao_status TEXT NOT NULL DEFAULT 'not_started'
CHECK (procuracao_status IN ('not_started', 'pending_verification', 'active'));
