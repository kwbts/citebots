-- Script to enable simple RLS for analysis_runs
-- Copy and paste this into the Supabase SQL Editor

-- Enable RLS on analysis_runs if it's not already enabled
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows all authenticated users to read reports
-- Our application code will filter by client_account_id
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.analysis_runs;

CREATE POLICY "Enable read access for all authenticated users" 
ON public.analysis_runs
FOR SELECT
USING (auth.role() = 'authenticated');