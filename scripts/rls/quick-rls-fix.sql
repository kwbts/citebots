-- Quick fix: Disable RLS on problematic tables to stop timeouts immediately
ALTER TABLE page_analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_queries DISABLE ROW LEVEL SECURITY;