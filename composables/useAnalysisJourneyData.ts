import { ref, Ref } from 'vue'
import { useSupabaseClient } from '#imports'

export interface AnalysisJourneyData {
  // Keywords
  keywordCount: number;
  keywordCategories: { name: string; count: number; percentage: number }[];
  keywordData: { 
    keyword: string; 
    category: string; 
    queries: number; 
    brandMentions: number; 
    source?: string 
  }[];
  
  // Queries
  totalQueries: number;
  queryIntentBreakdown: { name: string; count: number; percentage: number }[];
  queryTypeBreakdown: { name: string; count: number; percentage: number }[];
  queryData: { 
    query: string; 
    intent: string; 
    type: string; 
    platform: string; 
    brandMentioned: boolean 
  }[];
  
  // Responses
  totalResponses: number;
  brandMentions: number;
  brandPagesCited: number;
  responseData: { 
    query: string; 
    platform: string; 
    responseOutcome: string; 
    brandMentionType: string | null; 
    sentiment: string | null; 
    citationCount: number 
  }[];
  
  // Citations
  totalCitations: number;
  brandCitations: number;
  competitorCitations: number;
  citationData: { 
    url: string; 
    domain: string; 
    isBrand: boolean; 
    isCompetitor: boolean; 
    competitorName?: string; 
    relevance: number; 
    queries: number 
  }[];
}

export function useAnalysisJourneyData(analysisRunId: string | Ref<string>) {
  const runId = typeof analysisRunId === 'string' ? analysisRunId : analysisRunId.value
  const supabase = useSupabaseClient()
  const journeyData: Ref<AnalysisJourneyData | null> = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const fetchAnalysisJourneyData = async () => {
    try {
      loading.value = true
      
      // Step 1: Get basic analysis run data
      const { data: runData, error: runError } = await supabase
        .from('analysis_runs')
        .select('*')
        .eq('id', runId)
        .single()

      if (runError) throw runError
      if (!runData) throw new Error('Analysis run not found')

      // Step 2: Fetch all queries related to this analysis run
      const { data: queriesData, error: queriesError } = await supabase
        .from('analysis_queries')
        .select('*')
        .eq('analysis_run_id', runId)
      
      if (queriesError) throw queriesError
      if (!queriesData) throw new Error('No queries found for this analysis run')
      
      // Step 3: Fetch all page analyses related to these queries
      const queryIds = queriesData.map(q => q.id)
      const { data: pageAnalysesData, error: pageAnalysesError } = await supabase
        .from('page_analyses')
        .select('*')
        .in('query_id', queryIds)
      
      if (pageAnalysesError) throw pageAnalysesError
      
      // Process Keywords Section Data
      const keywordMap = new Map()
      const keywordCategoryMap = new Map()
      
      queriesData.forEach(query => {
        const keyword = query.query_keyword
        const category = query.query_category || 'Uncategorized'
        
        if (keyword) {
          if (!keywordMap.has(keyword)) {
            keywordMap.set(keyword, {
              keyword,
              category,
              queries: 0,
              brandMentions: 0,
              source: query.data_source
            })
          }
          
          const keywordData = keywordMap.get(keyword)
          keywordData.queries++
          if (query.brand_mentioned) keywordData.brandMentions++
          
          // Add to category counts
          if (!keywordCategoryMap.has(category)) {
            keywordCategoryMap.set(category, { name: category, count: 0 })
          }
          
          const categoryData = keywordCategoryMap.get(category)
          categoryData.count++
        }
      })
      
      // Process query intent and type breakdowns
      const intentMap = new Map()
      const typeMap = new Map()
      
      queriesData.forEach(query => {
        const intent = query.query_intent || 'Unknown'
        const type = query.query_type || 'Unknown'
        
        if (!intentMap.has(intent)) {
          intentMap.set(intent, { name: intent, count: 0 })
        }
        intentMap.get(intent).count++
        
        if (!typeMap.has(type)) {
          typeMap.set(type, { name: type, count: 0 })
        }
        typeMap.get(type).count++
      })
      
      // Calculate percentages for categories
      const totalKeywords = keywordCategoryMap.size
      const keywordCategories = Array.from(keywordCategoryMap.values()).map(category => {
        return {
          ...category,
          percentage: Math.round((category.count / totalKeywords) * 100) || 0
        }
      })
      
      // Calculate percentages for intents and types
      const queryIntentBreakdown = Array.from(intentMap.values()).map(intent => {
        return {
          ...intent,
          percentage: Math.round((intent.count / queriesData.length) * 100) || 0
        }
      })
      
      const queryTypeBreakdown = Array.from(typeMap.values()).map(type => {
        return {
          ...type,
          percentage: Math.round((type.count / queriesData.length) * 100) || 0
        }
      })
      
      // Calculate citation metrics
      const totalCitations = pageAnalysesData?.length || 0
      const brandCitations = pageAnalysesData?.filter(page => page.is_client_domain)?.length || 0
      const competitorCitations = pageAnalysesData?.filter(page => page.is_competitor_domain)?.length || 0
      
      // Process citation data
      const citationMap = new Map()
      
      pageAnalysesData?.forEach(page => {
        const url = page.citation_url
        if (url && !citationMap.has(url)) {
          citationMap.set(url, {
            url,
            domain: page.domain_name || new URL(url).hostname,
            isBrand: page.is_client_domain || false,
            isCompetitor: page.is_competitor_domain || false,
            competitorName: page.competitor_names?.length > 0 ? page.competitor_names[0] : undefined,
            relevance: page.relevance_score || 5.0,
            queries: 1
          })
        } else if (url) {
          citationMap.get(url).queries++
        }
      })
      
      // Build the final data object
      journeyData.value = {
        // Keywords
        keywordCount: keywordMap.size,
        keywordCategories,
        keywordData: Array.from(keywordMap.values()),

        // Queries
        totalQueries: queriesData.length,
        queryIntentBreakdown,
        queryTypeBreakdown,
        queryData: queriesData.map(q => ({
          query: q.query_text,
          intent: q.query_intent || 'Unknown',
          type: q.query_type || 'Unknown',
          platform: q.data_source,
          brandMentioned: q.brand_mentioned || false
        })),

        // Raw data for direct access
        rawAnalysisQueries: queriesData,

        // Responses
        totalResponses: queriesData.length,
        brandMentions: queriesData.filter(q => q.brand_mentioned).length,
        brandPagesCited: pageAnalysesData?.filter(p => p.is_client_domain).length || 0,
        responseData: queriesData.map(q => ({
          query: q.query_text,
          platform: q.data_source,
          responseOutcome: q.response_outcome || 'Unknown',
          brandMentionType: q.brand_mention_type,
          sentiment: q.brand_sentiment > 0.2 ? 'Positive' : q.brand_sentiment < -0.2 ? 'Negative' : 'Neutral',
          citationCount: q.citation_count || 0
        })),

        // Citations
        totalCitations,
        brandCitations,
        competitorCitations,
        citationData: Array.from(citationMap.values())
      }
      
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching analysis journey data:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    journeyData,
    loading,
    error,
    fetchAnalysisJourneyData
  }
}