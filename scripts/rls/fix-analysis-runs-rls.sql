-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own analysis runs" ON analysis_runs;
DROP POLICY IF EXISTS "Users can create analysis runs for their clients" ON analysis_runs;
DROP POLICY IF EXISTS "Users can update their own analysis runs" ON analysis_runs;

-- Create new policies based on client ownership
CREATE POLICY "Users can view their own analysis runs"
  ON analysis_runs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = analysis_runs.client_id
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create analysis runs for their clients"
  ON analysis_runs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own analysis runs"
  ON analysis_runs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = analysis_runs.client_id
      AND c.created_by = auth.uid()
    )
  );

-- Also fix the policies for analysis_queries
DROP POLICY IF EXISTS "Users can view analysis queries for their runs" ON analysis_queries;
DROP POLICY IF EXISTS "Users can create analysis queries for their runs" ON analysis_queries;

CREATE POLICY "Users can view analysis queries for their runs"
  ON analysis_queries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_runs ar
      JOIN clients c ON c.id = ar.client_id
      WHERE ar.id = analysis_queries.analysis_run_id
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create analysis queries for their runs"
  ON analysis_queries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analysis_runs ar
      JOIN clients c ON c.id = ar.client_id
      WHERE ar.id = analysis_run_id
      AND c.created_by = auth.uid()
    )
  );

-- Fix page_analyses policies
DROP POLICY IF EXISTS "Users can view page analyses for their runs" ON page_analyses;
DROP POLICY IF EXISTS "Users can create page analyses for their runs" ON page_analyses;

CREATE POLICY "Users can view page analyses for their runs"
  ON page_analyses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_queries aq
      JOIN analysis_runs ar ON ar.id = aq.analysis_run_id
      JOIN clients c ON c.id = ar.client_id
      WHERE aq.id = page_analyses.query_id  -- Changed from analysis_query_id to query_id
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create page analyses for their runs"
  ON page_analyses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analysis_queries aq
      JOIN analysis_runs ar ON ar.id = aq.analysis_run_id
      JOIN clients c ON c.id = ar.client_id
      WHERE aq.id = page_analyses.query_id  -- Changed from analysis_query_id to query_id
      AND c.created_by = auth.uid()
    )
  );