// Helper function to queue a query for background processing
async function queueQuery(
  analysisRunId: string,
  query: any,
  specificPlatform: string,
  client: any,
  competitors: any[],
  serviceClient: any
) {
  const queryText = query.query_text || '';
  if (!queryText) {
    throw new Error('Missing query text');
  }
  
  console.log(`Queuing query: "${queryText}" for ${specificPlatform}`);
  
  // Store query data in standardized format
  const queryData = {
    query_text: queryText,
    keyword: query.keyword || '',
    intent: query.intent || '',
    platform: specificPlatform,
    client: {
      id: client.id,
      name: client.name,
      domain: client.domain,
      competitors: competitors
    }
  };
  
  // Add to the analysis_queue table with both nested and flat fields
  const { data, error } = await serviceClient
    .from('analysis_queue')
    .insert({
      analysis_run_id: analysisRunId,
      // Include flat fields for direct access
      query_text: queryText,
      platform: specificPlatform,
      client_id: client.id,
      client_name: client.name,
      client_domain: client.domain,
      competitors: competitors,
      // Keep query_data for backward compatibility
      query_data: queryData,
      status: 'pending',
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error(`Failed to queue query "${queryText}":`, error);
    throw new Error(`Failed to queue query: ${error.message}`);
  }
  
  return data;
}