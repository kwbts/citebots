import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { analysis_run_id } = body
    
    if (!analysis_run_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Analysis run ID is required'
      })
    }
    
    const config = useRuntimeConfig()
    
    // Create a service client to access the data
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceKey,
      {
        auth: {
          persistSession: false
        }
      }
    )
    
    // Get analysis run details
    const { data: analysisRun, error: runError } = await supabase
      .from('analysis_runs')
      .select('*')
      .eq('id', analysis_run_id)
      .single()
      
    if (runError) throw runError
    
    // EMERGENCY: Skip page_analyses JOIN due to resource exhaustion
    // TODO: Re-enable once RLS is properly fixed
    const { data: queries, error: queryError } = await supabase
      .from('analysis_queries')
      .select('*')
      .eq('analysis_run_id', analysis_run_id)
      .order('created_at')
      
    if (queryError) throw queryError
    
    // Calculate validation metrics
    const validation = {
      run_id: analysis_run_id,
      status: analysisRun.status,
      total_queries: analysisRun.queries_total,
      completed_queries: analysisRun.queries_completed,
      queries: queries.map(q => ({
        query_text: q.query_text,
        citation_count: q.citation_count,
        pages_analyzed: q.page_analyses?.length || 0,
        brand_mentioned: q.brand_mentioned,
        status: q.status
      })),
      summary: {
        total_citations: queries.reduce((sum, q) => sum + (q.citation_count || 0), 0),
        total_pages_analyzed: queries.reduce((sum, q) => sum + (q.page_analyses?.length || 0), 0),
        brand_mentions: queries.filter(q => q.brand_mentioned).length,
        success_rate: analysisRun.queries_total > 0 
          ? (analysisRun.queries_completed / analysisRun.queries_total * 100).toFixed(1) + '%'
          : '0%'
      }
    }
    
    return {
      success: true,
      validation
    }
    
  } catch (error) {
    console.error('Validation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to validate analysis'
    })
  }
})