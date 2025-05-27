-- CLEANUP LEGACY DATABASE OBJECTS
-- Remove old views and tables from the edge function era

-- =============== DROP SECURITY DEFINER VIEWS ===============

-- 1. Drop queue_status view (legacy edge function monitoring)
DROP VIEW IF EXISTS public.queue_status CASCADE;

-- 2. Drop competitor_analysis_summary view (legacy reporting)
DROP VIEW IF EXISTS public.competitor_analysis_summary CASCADE;

-- 3. Drop page_competitor_insights view (legacy analytics)
DROP VIEW IF EXISTS public.page_competitor_insights CASCADE;

-- =============== DROP LEGACY TABLES ===============

-- 4. Drop query_queue table (replaced by analysis_queue)
DROP TABLE IF EXISTS public.query_queue CASCADE;

-- =============== VERIFICATION ===============

-- Check that the objects are gone
SELECT 
  'Views remaining:' as check_type,
  COUNT(*) as count
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN ('queue_status', 'competitor_analysis_summary', 'page_competitor_insights')

UNION ALL

SELECT 
  'Legacy tables remaining:' as check_type,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('query_queue');

-- =============== CLEANUP SUMMARY ===============

SELECT 'Legacy database objects cleanup completed' as status;

-- Note: These objects were from the old edge function architecture
-- - queue_status: Monitored edge function processing 
-- - competitor_analysis_summary: Legacy reporting view
-- - page_competitor_insights: Legacy analytics view  
-- - query_queue: Old queue table (replaced by analysis_queue)
--
-- All functionality now handled by:
-- - Local server for queue processing
-- - analysis_queue table for queue management
-- - Direct table queries for reporting