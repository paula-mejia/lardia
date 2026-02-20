-- Fix: remove overly permissive payslip_confirmations RLS policies.
-- Previously used using(true) for SELECT and UPDATE, exposing all records.
-- Token-based access is now handled by server API route with service role.

DROP POLICY IF EXISTS "Anyone can read confirmations" ON public.payslip_confirmations;
DROP POLICY IF EXISTS "Anyone can update confirmations" ON public.payslip_confirmations;
DROP POLICY IF EXISTS "Service role can insert confirmations" ON public.payslip_confirmations;

-- Employers can view their employees' confirmations in the dashboard
CREATE POLICY "Employers can view their confirmations"
  ON public.payslip_confirmations FOR SELECT
  USING (employer_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies for anon or authenticated roles.
-- All writes (webhook inserts, confirm API updates) use service role,
-- which bypasses RLS entirely.
