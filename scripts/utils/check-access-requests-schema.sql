-- Check access_requests table schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'access_requests' 
ORDER BY ordinal_position;