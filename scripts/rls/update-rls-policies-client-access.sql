-- Update RLS policies to support client role users accessing only their assigned clients

-- 1. Update clients table policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Super admins can manage all clients" ON clients;

-- New policies for clients table
CREATE POLICY "Super admins can manage all clients"
  ON clients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can view clients they have access to"
  ON clients
  FOR SELECT
  USING (
    -- Super admins can see all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
    OR
    -- Client users can see their assigned clients
    EXISTS (
      SELECT 1 FROM client_access
      WHERE client_access.client_id = clients.id
      AND client_access.user_id = auth.uid()
    )
    OR
    -- Original owners can see their own clients
    created_by = auth.uid()
  );

-- 2. Update analysis_runs table policies
DROP POLICY IF EXISTS "Users can view their own analysis runs" ON analysis_runs;
DROP POLICY IF EXISTS "Super admins can manage all analysis runs" ON analysis_runs;

CREATE POLICY "Super admins can manage all analysis runs"
  ON analysis_runs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can view analysis runs for accessible clients"
  ON analysis_runs
  FOR SELECT
  USING (
    -- Super admins can see all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
    OR
    -- Client users can see runs for their assigned clients
    EXISTS (
      SELECT 1 FROM client_access
      WHERE client_access.client_id = analysis_runs.client_id
      AND client_access.user_id = auth.uid()
    )
    OR
    -- Original creators can see their own runs
    created_by = auth.uid()
  );

-- 3. Update analysis_queries table policies
DROP POLICY IF EXISTS "Users can view their own analysis queries" ON analysis_queries;
DROP POLICY IF EXISTS "Super admins can manage all analysis queries" ON analysis_queries;

CREATE POLICY "Super admins can manage all analysis queries"
  ON analysis_queries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can view analysis queries for accessible clients"
  ON analysis_queries
  FOR SELECT
  USING (
    -- Super admins can see all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
    OR
    -- Client users can see queries for their assigned clients via analysis_runs
    EXISTS (
      SELECT 1 FROM analysis_runs ar
      JOIN client_access ca ON ca.client_id = ar.client_id
      WHERE ar.id = analysis_queries.analysis_run_id
      AND ca.user_id = auth.uid()
    )
  );

-- 4. Update page_analyses table policies
DROP POLICY IF EXISTS "Users can view their own page analyses" ON page_analyses;
DROP POLICY IF EXISTS "Super admins can manage all page analyses" ON page_analyses;

CREATE POLICY "Super admins can manage all page analyses"
  ON page_analyses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can view page analyses for accessible clients"
  ON page_analyses
  FOR SELECT
  USING (
    -- Super admins can see all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
    OR
    -- Client users can see page analyses for their assigned clients via analysis_queries -> analysis_runs
    EXISTS (
      SELECT 1 FROM analysis_queries aq
      JOIN analysis_runs ar ON ar.id = aq.analysis_run_id
      JOIN client_access ca ON ca.client_id = ar.client_id
      WHERE aq.id = page_analyses.query_id
      AND ca.user_id = auth.uid()
    )
  );

-- 5. Update competitors table policies
DROP POLICY IF EXISTS "Users can view competitors for their clients" ON competitors;
DROP POLICY IF EXISTS "Super admins can manage all competitors" ON competitors;

CREATE POLICY "Super admins can manage all competitors"
  ON competitors
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can view competitors for accessible clients"
  ON competitors
  FOR SELECT
  USING (
    -- Super admins can see all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
    OR
    -- Client users can see competitors for their assigned clients
    EXISTS (
      SELECT 1 FROM client_access
      WHERE client_access.client_id = competitors.client_id
      AND client_access.user_id = auth.uid()
    )
  );

-- Comments for documentation
COMMENT ON POLICY "Users can view clients they have access to" ON clients IS 'Allows client users to see only their assigned clients via client_access table';
COMMENT ON POLICY "Users can view analysis runs for accessible clients" ON analysis_runs IS 'Allows client users to see analysis runs for their assigned clients';
COMMENT ON POLICY "Users can view analysis queries for accessible clients" ON analysis_queries IS 'Allows client users to see queries for their assigned clients';
COMMENT ON POLICY "Users can view page analyses for accessible clients" ON page_analyses IS 'Allows client users to see page analyses for their assigned clients';
COMMENT ON POLICY "Users can view competitors for accessible clients" ON competitors IS 'Allows client users to see competitors for their assigned clients';