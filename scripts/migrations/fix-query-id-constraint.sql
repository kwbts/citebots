-- Check analysis_queries table structure
DO $$
DECLARE
    query_id_exists BOOLEAN;
    query_id_nullable BOOLEAN;
BEGIN
    -- Check if query_id column exists and if it has a NOT NULL constraint
    SELECT 
        EXISTS(
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'analysis_queries' 
              AND column_name = 'query_id'
        ) INTO query_id_exists;
        
    IF query_id_exists THEN
        -- Check if the column is nullable
        SELECT is_nullable = 'YES' 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'analysis_queries' 
          AND column_name = 'query_id'
        INTO query_id_nullable;
        
        -- If it exists and is not nullable, make it nullable
        IF NOT query_id_nullable THEN
            RAISE NOTICE 'Making query_id column nullable';
            EXECUTE 'ALTER TABLE analysis_queries ALTER COLUMN query_id DROP NOT NULL';
        END IF;
    ELSE
        RAISE NOTICE 'query_id column does not exist in analysis_queries table';
    END IF;
END
$$;

-- Add a default query_uuid generation function if needed
CREATE OR REPLACE FUNCTION generate_query_id()
RETURNS TEXT
LANGUAGE SQL
AS $$
    SELECT concat('q_', replace(gen_random_uuid()::text, '-', ''))
$$;

-- Add trigger to automatically generate query_id if it's NULL
DROP TRIGGER IF EXISTS set_query_id ON analysis_queries;

CREATE OR REPLACE FUNCTION trigger_set_query_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.query_id IS NULL THEN
        NEW.query_id := generate_query_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_query_id
BEFORE INSERT ON analysis_queries
FOR EACH ROW
EXECUTE FUNCTION trigger_set_query_id();