-- Create a function to submit analysis jobs to the queue
-- This bypasses RLS since it runs with SECURITY DEFINER

CREATE OR REPLACE FUNCTION submit_analysis_to_queue(
  p_client_id UUID,
  p_platform TEXT,
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
BEGIN
  -- Generate batch ID
  v_batch_id := 'custom_' || p_platform || '_' || EXTRACT(EPOCH FROM NOW())::bigint;
  
  -- Create analysis run
  INSERT INTO analysis_runs (
    client_id,
    batch_id,
    platform,
    status,
    queries_total,
    queries_completed,
    queries_queued,
    queries_processing,
    queries_failed,
    created_by
  ) VALUES (
    p_client_id,
    v_batch_id,
    p_platform,
    'running',
    array_length(p_queries, 1),
    0,
    array_length(p_queries, 1),
    0,
    0,
    auth.uid()
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
  
  -- Insert queue items
  FOR i IN 1..array_length(p_queries, 1) LOOP
    INSERT INTO analysis_queue (
      analysis_run_id,
      query_data,
      status,
      attempts,
      max_attempts
    ) VALUES (
      v_analysis_run.id,
      jsonb_build_object(
        'query_text', p_queries[i]->>'query_text',
        'keyword', p_queries[i]->>'keyword',
        'intent', p_queries[i]->>'intent',
        'platform', p_platform,
        'client', v_client_data
      ),
      'pending',
      0,
      3
    );
  END LOOP;
  
  -- Return result
  v_result := jsonb_build_object(
    'success', true,
    'analysis_run_id', v_analysis_run.id,
    'batch_id', v_batch_id,
    'queries_queued', array_length(p_queries, 1),
    'processing_method', 'local_server'
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION submit_analysis_to_queue(UUID, TEXT, JSONB[]) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_analysis_to_queue(UUID, TEXT, JSONB[]) TO service_role;