export const useAnalysisRunner = () => {
  const supabase = useSupabaseClient()
  
  interface AnalysisOptions {
    analysisRunId: string
    clientId: string
    platform: 'chatgpt' | 'perplexity' | 'both'
    keywords: string[]
    competitors: any[]
    brandName: string
    brandDomain: string
  }
  
  const runAnalysisQueries = async (options: AnalysisOptions) => {
    try {
      // Get service role client for database operations
      const serviceClient = createServiceClient()
      
      // Define query intents (simplified for MVP)
      const intents = [
        { 
          type: 'direct_experience',
          template: 'What is your experience with {keyword}?'
        },
        {
          type: 'recommendation_request', 
          template: 'Can you recommend the best {keyword}?'
        },
        {
          type: 'comparison_question',
          template: 'Compare the top {keyword} options'
        }
      ]
      
      let completedQueries = 0
      const totalQueries = options.keywords.length * intents.length
      
      // Process each keyword with each intent
      for (const keyword of options.keywords) {
        for (const intent of intents) {
          try {
            // Generate query text
            const queryText = intent.template.replace('{keyword}', keyword)
            
            // Create unique query ID
            const queryId = `${options.platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            
            // Insert query record
            const { data: queryRecord, error: queryError } = await serviceClient
              .from('analysis_queries')
              .insert({
                analysis_run_id: options.analysisRunId,
                query_id: queryId,
                query_text: queryText,
                query_keyword: keyword,
                query_intent: intent.type,
                data_source: options.platform,
                status: 'pending'
              })
              .select()
              .single()
              
            if (queryError) throw queryError
            
            // Execute the query analysis
            const result = await executeQuery({
              query: queryText,
              queryId: queryId,
              keyword: keyword,
              intent: intent.type,
              platform: options.platform,
              brandName: options.brandName,
              brandDomain: options.brandDomain,
              competitors: options.competitors
            })
            
            // Update query with results
            await serviceClient
              .from('analysis_queries')
              .update({
                model_response: result.model_response,
                citation_count: result.citation_count,
                brand_mentioned: result.brand_mentioned,
                brand_sentiment: result.brand_sentiment,
                competitor_mentioned_names: result.competitor_mentioned_names,
                competitor_count: result.competitor_count,
                associated_pages_count: result.associated_pages_count,
                response_match: result.response_match,
                response_outcome: result.response_outcome,
                brand_mention_type: result.brand_mention_type,
                competitor_context: result.competitor_context,
                action_orientation: result.action_orientation,
                query_competition: result.query_competition,
                status: 'completed',
                completed_at: new Date().toISOString()
              })
              .eq('id', queryRecord.id)
            
            // Insert page analyses
            if (result.associated_pages && result.associated_pages.length > 0) {
              const pageAnalyses = result.associated_pages.map(page => ({
                query_id: queryRecord.id,
                page_analysis_id: page.page_analysis_id,
                citation_url: page.citation_url,
                citation_position: page.citation_position,
                domain_name: page.domain_authority?.domain_name,
                is_client_domain: page.is_client_domain,
                is_competitor_domain: page.is_competitor_domain,
                mention_type: page.mention_type,
                analysis_notes: page.analysis_notes,
                technical_seo: page.technical_seo,
                page_performance: page.page_performance,
                domain_authority: page.domain_authority,
                on_page_seo: page.on_page_seo,
                content_quality: page.content_quality,
                page_analysis: page.page_analysis
              }))
              
              await serviceClient
                .from('page_analyses')
                .insert(pageAnalyses)
            }
            
            // Update progress
            completedQueries++
            await serviceClient
              .from('analysis_runs')
              .update({ 
                queries_completed: completedQueries,
                updated_at: new Date().toISOString()
              })
              .eq('id', options.analysisRunId)
              
          } catch (error) {
            console.error(`Error processing query "${queryText}":`, error)
            // Continue with next query
          }
        }
      }
      
      // Mark analysis run as completed
      await serviceClient
        .from('analysis_runs')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', options.analysisRunId)
        
      return { success: true, completedQueries }
      
    } catch (error) {
      console.error('Error in analysis runner:', error)
      
      // Mark analysis run as failed
      await serviceClient
        .from('analysis_runs')
        .update({ 
          status: 'failed',
          error_message: error.message
        })
        .eq('id', options.analysisRunId)
        
      throw error
    }
  }
  
  // Execute a single query (adapted from the original citebots.js)
  const executeQuery = async (options: any) => {
    // This is a simplified version - in production, you'd integrate the full citebots logic
    // For now, we'll use ScrapingBee and return mock data for testing
    
    try {
      // Make API calls to ChatGPT/Perplexity based on platform
      let response
      if (options.platform === 'chatgpt' || options.platform === 'both') {
        // Call ChatGPT API
        response = await $fetch('/api/query-chatgpt', {
          method: 'POST',
          body: {
            query: options.query,
            context: {
              brandName: options.brandName,
              competitors: options.competitors
            }
          }
        })
      } else if (options.platform === 'perplexity') {
        // Call Perplexity API
        response = await $fetch('/api/query-perplexity', {
          method: 'POST',
          body: {
            query: options.query,
            context: {
              brandName: options.brandName,
              competitors: options.competitors
            }
          }
        })
      }
      
      // Extract citations and analyze content
      // This would use the citation extraction logic from citebots.js
      
      // For MVP, return structured data
      return {
        model_response: response?.content || 'Sample response',
        citation_count: 3,
        brand_mentioned: Math.random() > 0.7,
        brand_sentiment: Math.random() * 2 - 1,
        competitor_mentioned_names: [],
        competitor_count: 0,
        associated_pages_count: 2,
        response_match: 'direct',
        response_outcome: 'information',
        brand_mention_type: 'none',
        competitor_context: 'none',
        action_orientation: 'passive',
        query_competition: 'opportunity',
        associated_pages: [] // Would include crawled page data
      }
      
    } catch (error) {
      console.error('Error executing query:', error)
      throw error
    }
  }
  
  // Create service client for server-side operations
  const createServiceClient = () => {
    if (process.server) {
      const { createClient } = require('@supabase/supabase-js')
      const config = useRuntimeConfig()
      
      return createClient(
        config.public.supabaseUrl,
        config.supabaseServiceKey,
        {
          auth: {
            persistSession: false
          }
        }
      )
    }
    return supabase
  }
  
  return {
    runAnalysisQueries,
    executeQuery
  }
}