import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { clientId, filters } = body

    if (!clientId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Client ID is required'
      })
    }

    // Initialize Supabase client
    const supabaseUrl = useRuntimeConfig().public.supabaseUrl
    const supabaseKey = useRuntimeConfig().supabaseServiceKey
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Build date filter
    let dateFilter = ''
    if (filters?.dateRange && filters.dateRange !== 'all') {
      const now = new Date()
      let daysAgo = 30 // default

      switch (filters.dateRange) {
        case '7d': daysAgo = 7; break
        case '30d': daysAgo = 30; break
        case '90d': daysAgo = 90; break
        case '6m': daysAgo = 180; break
        case '1y': daysAgo = 365; break
        case 'custom':
          if (filters.customStart && filters.customEnd) {
            dateFilter = `created_at.gte.${filters.customStart} AND created_at.lte.${filters.customEnd}`
          }
          break
      }

      if (!dateFilter && daysAgo) {
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
        dateFilter = `created_at.gte.${cutoffDate.toISOString()}`
      }
    }

    // Build platform filter
    let platformFilter = ''
    if (filters?.platforms?.length) {
      platformFilter = `data_source.in.(${filters.platforms.join(',')})`
    }

    // Build analysis run filter
    let runFilter = ''
    if (filters?.analysisRuns?.length) {
      runFilter = `analysis_run_id.in.(${filters.analysisRuns.join(',')})`
    }

    // Combine filters
    const queryFilters = [
      `analysis_runs.client_id.eq.${clientId}`,
      dateFilter,
      platformFilter,
      runFilter
    ].filter(Boolean).join(' AND ')

    // Fetch analysis queries with associated pages and analysis run data
    const { data: queries, error: queriesError } = await supabase
      .from('analysis_queries')
      .select(`
        *,
        analysis_runs!inner(
          id,
          client_id,
          platform,
          status,
          created_at,
          batch_id
        )
      `)
      .or(queryFilters)
      .order('created_at', { ascending: false })

    if (queriesError) {
      console.error('Error fetching queries:', queriesError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch analysis queries'
      })
    }

    // Apply branded/unbranded filter after fetching (since it's based on brand_mentioned field)
    let filteredQueries = queries || []
    if (filters?.brandedQueries === 'branded') {
      filteredQueries = filteredQueries.filter(q => q.brand_mentioned === true)
    } else if (filters?.brandedQueries === 'unbranded') {
      filteredQueries = filteredQueries.filter(q => q.brand_mentioned === false || !q.brand_mentioned)
    }

    // Fetch client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError) {
      console.error('Error fetching client:', clientError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch client data'
      })
    }

    // Fetch competitors for this client
    const { data: competitors, error: competitorsError } = await supabase
      .from('competitors')
      .select('*')
      .eq('client_id', clientId)
      .order('name')

    if (competitorsError) {
      console.error('Error fetching competitors:', competitorsError)
      // Don't throw error for competitors, just log and continue
    }

    // Get analysis runs for this client (for filter dropdown)
    const { data: analysisRuns, error: runsError } = await supabase
      .from('analysis_runs')
      .select('id, platform, created_at, status, batch_id')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (runsError) {
      console.error('Error fetching analysis runs:', runsError)
    }

    // Calculate some basic metrics for the response
    const totalQueries = filteredQueries.length
    const brandMentionCount = filteredQueries.filter(q => q.brand_mentioned).length
    const brandMentionRate = totalQueries > 0 ? (brandMentionCount / totalQueries) * 100 : 0

    // Calculate citation metrics
    const queriesWithCitations = filteredQueries.filter(q => 
      q.associated_pages?.some(page => 
        page.is_client_domain || 
        page.brand_mentioned ||
        (page.citation_url && client.domain && page.citation_url.includes(client.domain))
      )
    ).length

    const citationRate = brandMentionCount > 0 ? (queriesWithCitations / brandMentionCount) * 100 : 0
    const noCitationCount = brandMentionCount - queriesWithCitations
    const noCitationPercentage = brandMentionCount > 0 ? (noCitationCount / brandMentionCount) * 100 : 0

    // Platform breakdown
    const platformBreakdown = {}
    filteredQueries.forEach(query => {
      const platform = query.data_source || 'unknown'
      if (!platformBreakdown[platform]) {
        platformBreakdown[platform] = { total: 0, mentioned: 0 }
      }
      platformBreakdown[platform].total++
      if (query.brand_mentioned) {
        platformBreakdown[platform].mentioned++
      }
    })

    const platformData = Object.entries(platformBreakdown).map(([platform, data]) => ({
      platform,
      label: getPlatformLabel(platform),
      total: data.total,
      mentioned: data.mentioned,
      mentionRate: data.total > 0 ? (data.mentioned / data.total) * 100 : 0
    }))

    // Return structured response
    return {
      success: true,
      data: {
        // Raw query data
        queries: filteredQueries,
        
        // Client and competitor data
        client,
        competitors: competitors || [],
        analysisRuns: analysisRuns || [],
        
        // Summary metrics
        summary: {
          totalQueries,
          brandMentionCount,
          brandMentionRate: Math.round(brandMentionRate * 10) / 10,
          citationRate: Math.round(citationRate * 10) / 10,
          noCitationCount,
          noCitationPercentage: Math.round(noCitationPercentage * 10) / 10,
          platformBreakdown: platformData
        },
        
        // Applied filters for reference
        appliedFilters: filters
      }
    }

  } catch (error) {
    console.error('Dashboard API error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})

// Helper function to get platform labels
function getPlatformLabel(platform) {
  const labels = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    perplexity: 'Perplexity',
    bard: 'Bard',
    gemini: 'Gemini'
  }
  return labels[platform?.toLowerCase()] || platform || 'Unknown'
}