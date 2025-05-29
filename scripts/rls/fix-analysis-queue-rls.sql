-- Fix RLS policies for analysis_queue table to allow function inserts

-- Check current policies
SELECT schemaname, tablename, policyname, roles, cmd, permissive, qual, with_check
FROM pg_policies 
WHERE tablename = 'analysis_queue';

-- Temporarily disable RLS to test
-- ALTER TABLE analysis_queue DISABLE ROW LEVEL SECURITY;

-- Or add a policy that allows the function to insert
CREATE POLICY "Allow function inserts on analysis_queue" 
ON analysis_queue 
FOR INSERT 
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON analysis_queue TO authenticated;
GRANT ALL ON analysis_queue TO service_role;

-- Test the function again
SELECT 'RLS policies updated for analysis_queue' AS status;