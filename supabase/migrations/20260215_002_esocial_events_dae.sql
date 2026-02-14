-- eSocial events table
CREATE TABLE IF NOT EXISTS esocial_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected')),
  reference_month INTEGER NOT NULL CHECK (reference_month BETWEEN 1 AND 12),
  reference_year INTEGER NOT NULL CHECK (reference_year >= 2020),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  response_data JSONB
);

-- DAE records table
CREATE TABLE IF NOT EXISTS dae_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  reference_month INTEGER NOT NULL CHECK (reference_month BETWEEN 1 AND 12),
  reference_year INTEGER NOT NULL CHECK (reference_year >= 2020),
  total_amount NUMERIC(12,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'paid', 'overdue')),
  barcode TEXT,
  breakdown JSONB,
  employees JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_esocial_events_employer ON esocial_events(employer_id);
CREATE INDEX IF NOT EXISTS idx_esocial_events_period ON esocial_events(reference_year, reference_month);
CREATE INDEX IF NOT EXISTS idx_esocial_events_type ON esocial_events(event_type);
CREATE INDEX IF NOT EXISTS idx_dae_records_employer ON dae_records(employer_id);
CREATE INDEX IF NOT EXISTS idx_dae_records_period ON dae_records(reference_year, reference_month);

-- RLS
ALTER TABLE esocial_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dae_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own esocial events" ON esocial_events
  FOR SELECT USING (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own esocial events" ON esocial_events
  FOR INSERT WITH CHECK (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own dae records" ON dae_records
  FOR SELECT USING (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own dae records" ON dae_records
  FOR INSERT WITH CHECK (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
  );
