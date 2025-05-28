-- Create updated function to submit analysis jobs to the queue with multi-platform support
-- This bypasses RLS since it runs with SECURITY DEFINER

CREATE OR REPLACE FUNCTION submit_analysis_to_queue(
  p_client_id UUID,
  p_platforms TEXT[],  -- Changed to array of platforms
  p_queries JSONB[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_analysis_run analysis_runs%ROWTYPE;
  v_client_data JSONB;
  v_queue_item JSONB;
  v_batch_id TEXT;
  v_result JSONB;
  v_platform TEXT;
  v_total_queue_items INT;
BEGIN
  -- Generate batch ID with all platforms
  v_batch_id := 'multi_' || array_to_string(p_platforms, '_') || '_' || EXTRACT(EPOCH FROM NOW())::bigint;
  
  -- Calculate total queue items (queries × platforms)
  v_total_queue_items := array_length(p_queries, 1) * array_length(p_platforms, 1);
  
  -- Create analysis run with combined platform info
  INSERT INTO analysis_runs (
    client_id,
    batch_id,
    platform,  -- Store all platforms as comma-separated for backwards compatibility
    status,
    queries_total,
    queries_completed,
    queries_queued,
    queries_processing,
    queries_failed,
    created_by,
    processing_method
  ) VALUES (
    p_client_id,
    v_batch_id,
    array_to_string(p_platforms, ','),  -- Store as "chatgpt,perplexity"
    'running',
    v_total_queue_items,  -- Total individual query executions
    0,
    v_total_queue_items,
    0,
    0,
    auth.uid(),
    'queue'
  ) RETURNING * INTO v_analysis_run;
  
  -- Get client data with competitors
  SELECT jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'domain', c.domain,
    'competitors', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('name', comp.name, 'domain', comp.domain))
       FROM competitors comp WHERE comp.client_id = c.id),
      '[]'::jsonb
    )
  )
  INTO v_client_data
  FROM clients c
  WHERE c.id = p_client_id;
  
  -- Insert queue items for each query × platform combination
  FOR i IN 1..array_length(p_queries, 1) LOOP
    FOR j IN 1..array_length(p_platforms, 1) LOOP
      v_platform := p_platforms[j];
      
      INSERT INTO analysis_queue (
        analysis_run_id,
        query_data,
        status,
        attempts,
        max_attempts,
        priority
      ) VALUES (
        v_analysis_run.id,
        jsonb_build_object(
          'query_text', p_queries[i]->>'query_text',
          'keyword', p_queries[i]->>'keyword',
          'intent', p_queries[i]->>'intent',
          'platform', v_platform,  -- Individual platform for each queue item
          'client', v_client_data
        ),
        'pending',
        0,
        3,
        1  -- Standard priority
      );
    END LOOP;
  END LOOP;
  
  -- Return result
  v_result := jsonb_build_object(
    'success', true,
    'analysis_run_id', v_analysis_run.id,
    'batch_id', v_batch_id,
    'queries_queued', v_total_queue_items,
    'platforms', p_platforms,
    'processing_method', 'queue',
    'total_query_executions', v_total_queue_items
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'code', SQLSTATE
  );
END;
$$;

-- Keep legacy function for backwards compatibility
CREATE OR REPLACE FUNCTION submit_analysis_to_queue(
  p_client_id UUID,
  p_platform TEXT,  -- Single platform (legacy)
  p_queries JSONB[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the new multi-platform function with single platform
  RETURN submit_analysis_to_queue(p_client_id, ARRAY[p_platform], p_queries);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION submit_analysis_to_queue(UUID, TEXT[], JSONB[]) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_analysis_to_queue(UUID, TEXT[], JSONB[]) TO service_role;
GRANT EXECUTE ON FUNCTION submit_analysis_to_queue(UUID, TEXT, JSONB[]) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_analysis_to_queue(UUID, TEXT, JSONB[]) TO service_role;