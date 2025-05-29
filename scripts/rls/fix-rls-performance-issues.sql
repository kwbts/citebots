-- Fix RLS performance issues by simplifying policies
-- The complex JOIN-based policies are causing timeouts

-- 1. Temporarily disable RLS on problematic tables to stop timeouts
ALTER TABLE page_analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_queries DISABLE ROW LEVEL SECURITY;

-- 2. Drop the complex policies that are causing timeouts
DROP POLICY IF EXISTS "Users can view analysis queries for accessible clients" ON analysis_queries;
DROP POLICY IF EXISTS "Users can view page analyses for accessible clients" ON page_analyses;
DROP POLICY IF EXISTS "Users can view analysis runs for accessible clients" ON analysis_runs;
DROP POLICY IF EXISTS "Users can view clients they have access to" ON clients;

-- 3. Restore simple, fast policies for immediate functionality
-- Keep it simple - check ownership directly without complex joins

-- Simple clients policy
CREATE POLICY "Users can view their own clients or client access"
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
    -- Original ownership (backwards compatibility)
    created_by = auth.uid()
    OR
    -- User ID ownership (if using user_id column)
    user_id = auth.uid()
  );

-- Simple analysis runs policy  
CREATE POLICY "Users can view their own analysis runs"
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
    -- Original ownership
    created_by = auth.uid()
  );

-- Simple analysis queries policy (no complex joins)
CREATE POLICY "Users can view analysis queries for their runs"
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
    -- Check ownership through analysis_runs (single join only)
    EXISTS (
      SELECT 1 FROM analysis_runs
      WHERE analysis_runs.id = analysis_queries.analysis_run_id
      AND analysis_runs.created_by = auth.uid()
    )
  );

-- Simple page analyses policy (no complex joins)
CREATE POLICY "Users can view their own page analyses"
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
    -- Check ownership through analysis_queries -> analysis_runs (simplified)
    EXISTS (
      SELECT 1 FROM analysis_queries aq
      JOIN analysis_runs ar ON ar.id = aq.analysis_run_id
      WHERE aq.id = page_analyses.query_id
      AND ar.created_by = auth.uid()
    )
  );

-- 4. Re-enable RLS with simple policies
ALTER TABLE analysis_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analyses ENABLE ROW LEVEL SECURITY;

-- 5. Add indexes to improve performance of the remaining joins
CREATE INDEX IF NOT EXISTS idx_analysis_queries_analysis_run_id ON analysis_queries(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_page_analyses_query_id ON page_analyses(query_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_created_by ON analysis_runs(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- 6. Update statistics for better query planning
ANALYZE clients;
ANALYZE analysis_runs;
ANALYZE analysis_queries;
ANALYZE page_analyses;

-- Comments
COMMENT ON POLICY "Users can view their own clients or client access" ON clients IS 'Simplified policy for backwards compatibility and performance';
COMMENT ON POLICY "Users can view their own analysis runs" ON analysis_runs IS 'Simple ownership check for performance';
COMMENT ON POLICY "Users can view analysis queries for their runs" ON analysis_queries IS 'Single join policy for better performance';
COMMENT ON POLICY "Users can view their own page analyses" ON page_analyses IS 'Simplified join for performance while maintaining security';