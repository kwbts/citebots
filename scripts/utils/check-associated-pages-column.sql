-- Check if associated_pages column exists in analysis_queries table
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'analysis_queries'
AND column_name = 'associated_pages'
ORDER BY ordinal_position;

-- If the above returns no results, we need to add the column
-- Check all columns in analysis_queries to see current structure
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'analysis_queries'
ORDER BY ordinal_position;