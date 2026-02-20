-- Add missing UPDATE and DELETE RLS policies for esocial_events and dae_records.
-- Previously only SELECT and INSERT existed.

-- esocial_events: users can update their own events (e.g. retry from rejected -> draft)
CREATE POLICY "Users can update own esocial events" ON esocial_events
  FOR UPDATE USING (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
  ) WITH CHECK (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
  );

-- esocial_events: users can delete their own events (e.g. remove draft events to reprocess)
CREATE POLICY "Users can delete own esocial events" ON esocial_events
  FOR DELETE USING (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
  );

-- dae_records: users can update their own DAE records (e.g. mark as paid)
CREATE POLICY "Users can update own dae records" ON dae_records
  FOR UPDATE USING (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
  ) WITH CHECK (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
  );

-- dae_records: users can delete their own DAE records
CREATE POLICY "Users can delete own dae records" ON dae_records
  FOR DELETE USING (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
  );
