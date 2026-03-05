-- Add esocial_emp_id for RPA portal access
ALTER TABLE employers
  ADD COLUMN IF NOT EXISTS esocial_emp_id text;

COMMENT ON COLUMN employers.esocial_emp_id IS 'eSocial employer UUID returned from portal after procuração validation';
