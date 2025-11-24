-- Create RPC function to efficiently get brand mention counts per analysis run
-- This avoids the row limit issues and is much faster than fetching all queries

CREATE OR REPLACE FUNCTION get_brand_mention_counts(run_ids uuid[])
RETURNS TABLE (
  analysis_run_id uuid,
  brand_mention_count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    analysis_run_id,
    COUNT(*) FILTER (
      WHERE brand_mentioned = true
      AND brand_mention_type != 'implicit'
    ) as brand_mention_count
  FROM analysis_queries
  WHERE analysis_run_id = ANY(run_ids)
  GROUP BY analysis_run_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_brand_mention_counts(uuid[]) TO authenticated;
