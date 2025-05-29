-- Partner Support Migration
-- Add partner_id columns and update RLS policies

-- 1. Add partner_id to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES profiles(id);

-- 2. Add partner_id to analysis_runs table  
ALTER TABLE analysis_runs ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES profiles(id);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_partner_id ON clients(partner_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_partner_id ON analysis_runs(partner_id);

-- 4. Backfill existing data with super admin user
UPDATE clients 
SET partner_id = (SELECT id FROM profiles WHERE role = 'super_admin' LIMIT 1)
WHERE partner_id IS NULL;

UPDATE analysis_runs 
SET partner_id = (
  SELECT partner_id FROM clients 
  WHERE clients.id = analysis_runs.client_id
)
WHERE partner_id IS NULL;

-- 5. Update RLS policies for partner isolation

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Partners can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Partners can modify own clients" ON public.clients;
DROP POLICY IF EXISTS "Partners can view own analysis runs" ON public.analysis_runs;
DROP POLICY IF EXISTS "Partners can manage competitors for own clients" ON public.competitors;

-- Create new partner-aware policies for clients
CREATE POLICY "Partners can view own clients"
ON public.clients
FOR SELECT
USING (
  auth.uid() = partner_id OR
  auth.uid() = created_by OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Partners can modify own clients"
ON public.clients
FOR ALL
USING (
  auth.uid() = partner_id OR
  auth.uid() = created_by OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Create partner-aware policies for analysis_runs
CREATE POLICY "Partners can view own analysis runs"
ON public.analysis_runs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = analysis_runs.client_id 
    AND (clients.partner_id = auth.uid() OR clients.created_by = auth.uid())
  ) OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Partners can modify own analysis runs"
ON public.analysis_runs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = analysis_runs.client_id 
    AND (clients.partner_id = auth.uid() OR clients.created_by = auth.uid())
  ) OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Create partner-aware policies for competitors
CREATE POLICY "Partners can manage competitors for own clients"
ON public.competitors
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = competitors.client_id 
    AND (clients.partner_id = auth.uid() OR clients.created_by = auth.uid())
  ) OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Create partner-aware policies for analysis_queries
CREATE POLICY "Partners can view own analysis queries"
ON public.analysis_queries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM analysis_runs 
    JOIN clients ON clients.id = analysis_runs.client_id
    WHERE analysis_runs.id = analysis_queries.analysis_run_id
    AND (clients.partner_id = auth.uid() OR clients.created_by = auth.uid())
  ) OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Create partner-aware policies for page_analyses
CREATE POLICY "Partners can view own page analyses"
ON public.page_analyses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM analysis_queries 
    JOIN analysis_runs ON analysis_runs.id = analysis_queries.analysis_run_id
    JOIN clients ON clients.id = analysis_runs.client_id
    WHERE analysis_queries.id = page_analyses.query_id
    AND (clients.partner_id = auth.uid() OR clients.created_by = auth.uid())
  ) OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Create partner-aware policies for analysis_queue
CREATE POLICY "Partners can view own queue items"
ON public.analysis_queue
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM analysis_runs 
    JOIN clients ON clients.id = analysis_runs.client_id
    WHERE analysis_runs.id = analysis_queue.analysis_run_id
    AND (clients.partner_id = auth.uid() OR clients.created_by = auth.uid())
  ) OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);