import { defineStore } from 'pinia'

export const useBrandPerformanceStore = defineStore('brandPerformance', {
  state: () => ({
    // Dashboard data
    metrics: {
      mentionRate: {
        current: 0,
        previous: 0,
        trend: 'stable'
      },
      noCitationMentions: {
        count: 0,
        percentage: 0,
        opportunities: []
      },
      mentionRateTrend: null,
      noCitationTrend: null
    },
    
    // Query data
    queryData: [],
    selectedQuery: null,
    
    // Breakdown data for charts
    breakdownData: {
      byIntent: [],
      byType: [],
      byFunnelStage: [],
      byPlatform: []
    },
    
    // Sentiment analysis data
    sentimentData: {
      distribution: [],
      averageSentiment: 0,
      sentimentTrend: []
    },
    
    // Client and competitor data
    clientData: null,
    competitorData: [],
    selectedCompetitor: null,
    competitorMetrics: {},
    
    // Response outcome data
    outcomeData: {
      outcomes: [],
      competitorComparison: []
    },
    
    // Loading states
    loading: {
      dashboard: false,
      queries: false,
      competitors: false
    },
    
    // Error states
    errors: {
      dashboard: null,
      queries: null,
      competitors: null
    }
  }),

  getters: {
    // Get filtered queries based on current filters
    filteredQueries: (state) => (filters) => {
      return state.queryData.filter(query => {
        // Date range filter
        if (filters.dateRange && filters.dateRange !== 'all') {
          const queryDate = new Date(query.created_at)
          const now = new Date()
          const daysAgo = getDaysFromRange(filters.dateRange)
          const cutoff = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
          
          if (queryDate < cutoff) return false
        }
        
        // Platform filter
        if (filters.platforms?.length && !filters.platforms.includes(query.data_source)) {
          return false
        }
        
        // Branded queries filter
        if (filters.brandedQueries === 'branded' && !query.brand_mentioned) {
          return false
        }
        if (filters.brandedQueries === 'unbranded' && query.brand_mentioned) {
          return false
        }
        
        // Analysis run filter
        if (filters.analysisRuns?.length && !filters.analysisRuns.includes(query.analysis_run_id)) {
          return false
        }
        
        return true
      })
    },

    // Calculate brand mention metrics
    brandMentionMetrics: (state) => (filteredQueries) => {
      const total = filteredQueries.length
      const mentioned = filteredQueries.filter(q => q.brand_mentioned).length
      const mentionRate = total > 0 ? (mentioned / total) * 100 : 0
      
      // Calculate average mentions per query
      const mentionedQueries = filteredQueries.filter(q => q.brand_mentioned && q.brand_mention_count)
      const avgMentions = mentionedQueries.length > 0 
        ? mentionedQueries.reduce((sum, q) => sum + (q.brand_mention_count || 0), 0) / mentionedQueries.length
        : 0
      
      // Calculate platform breakdown
      const platformBreakdown = {}
      filteredQueries.forEach(query => {
        const platform = query.data_source
        if (!platformBreakdown[platform]) {
          platformBreakdown[platform] = { total: 0, mentioned: 0 }
        }
        platformBreakdown[platform].total++
        if (query.brand_mentioned) {
          platformBreakdown[platform].mentioned++
        }
      })
      
      const platformData = Object.entries(platformBreakdown).map(([name, data]) => ({
        name,
        label: getPlatformLabel(name),
        mentionRate: data.total > 0 ? (data.mentioned / data.total) * 100 : 0,
        mentioned: data.mentioned,
        total: data.total
      }))
      
      return {
        mentionRate,
        mentionedQueries: mentioned,
        totalQueries: total,
        avgMentions,
        platformBreakdown: platformData
      }
    },

    // Calculate no citation mentions
    noCitationMetrics: (state) => (filteredQueries) => {
      const brandMentions = filteredQueries.filter(q => q.brand_mentioned)
      const noCitationMentions = brandMentions.filter(q => 
        !q.associated_pages?.some(page => page.is_client_domain || page.brand_mentioned)
      )
      
      const count = noCitationMentions.length
      const percentage = brandMentions.length > 0 ? (count / brandMentions.length) * 100 : 0
      
      // Group by query intent for opportunities
      const opportunities = {}
      noCitationMentions.forEach(query => {
        const intent = query.query_intent || 'Unknown'
        opportunities[intent] = (opportunities[intent] || 0) + 1
      })
      
      const opportunityData = Object.entries(opportunities)
        .map(([type, count]) => ({
          type,
          label: getIntentLabel(type),
          count
        }))
        .sort((a, b) => b.count - a.count)
      
      return {
        count,
        percentage,
        totalMentions: brandMentions.length,
        opportunityData
      }
    }
  },

  actions: {
    // Load main dashboard data
    async loadDashboardData({ clientId, filters }) {
      this.loading.dashboard = true
      this.errors.dashboard = null
      
      try {
        // Fetch analysis queries with related data
        const response = await $fetch('/api/dashboard/brand-performance', {
          method: 'POST',
          body: {
            clientId,
            filters
          }
        })
        
        this.queryData = response.queries || []
        this.clientData = response.client
        this.competitorData = response.competitors || []
        
        // Calculate metrics
        this.calculateMetrics(filters)
        
        // Load additional data
        await Promise.all([
          this.loadBreakdownData(filters),
          this.loadSentimentData(filters),
          this.loadOutcomeData(filters)
        ])
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        this.errors.dashboard = error.message
      } finally {
        this.loading.dashboard = false
      }
    },

    // Calculate main metrics based on current data and filters
    calculateMetrics(filters) {
      const filteredQueries = this.filteredQueries(filters)
      
      // Brand mention rate metrics
      const brandMetrics = this.brandMentionMetrics(filteredQueries)
      this.metrics.mentionRate = {
        current: brandMetrics.mentionRate,
        mentionedQueries: brandMetrics.mentionedQueries,
        totalQueries: brandMetrics.totalQueries,
        avgMentions: brandMetrics.avgMentions,
        platformBreakdown: brandMetrics.platformBreakdown
      }
      
      // No citation metrics
      const noCitationMetrics = this.noCitationMetrics(filteredQueries)
      this.metrics.noCitationMentions = noCitationMetrics
    },

    // Load breakdown data for charts
    async loadBreakdownData(filters) {
      const filteredQueries = this.filteredQueries(filters)
      
      // Group by intent
      const intentGroups = {}
      filteredQueries.forEach(query => {
        const intent = query.query_intent || 'Unknown'
        if (!intentGroups[intent]) {
          intentGroups[intent] = { total: 0, mentioned: 0 }
        }
        intentGroups[intent].total++
        if (query.brand_mentioned) {
          intentGroups[intent].mentioned++
        }
      })
      
      this.breakdownData.byIntent = Object.entries(intentGroups)
        .map(([intent, data]) => ({
          intent,
          label: getIntentLabel(intent),
          total: data.total,
          mentioned: data.mentioned,
          mentionRate: data.total > 0 ? (data.mentioned / data.total) * 100 : 0
        }))
        .sort((a, b) => b.mentionRate - a.mentionRate)
      
      // Similar logic for other breakdowns...
      this.breakdownData.byType = this.calculateTypeBreakdown(filteredQueries)
      this.breakdownData.byFunnelStage = this.calculateFunnelBreakdown(filteredQueries)
      this.breakdownData.byPlatform = this.calculatePlatformBreakdown(filteredQueries)
    },

    // Load sentiment analysis data
    async loadSentimentData(filters) {
      const filteredQueries = this.filteredQueries(filters)
      const sentimentQueries = filteredQueries.filter(q => 
        q.brand_mentioned && q.brand_sentiment !== null && q.brand_sentiment !== undefined
      )
      
      // Calculate sentiment distribution
      const distribution = [
        {
          label: 'Positive',
          count: sentimentQueries.filter(q => q.brand_sentiment > 0.2).length,
          color: 'green'
        },
        {
          label: 'Neutral', 
          count: sentimentQueries.filter(q => q.brand_sentiment >= -0.2 && q.brand_sentiment <= 0.2).length,
          color: 'gray'
        },
        {
          label: 'Negative',
          count: sentimentQueries.filter(q => q.brand_sentiment < -0.2).length,
          color: 'red'
        }
      ]
      
      const averageSentiment = sentimentQueries.length > 0
        ? sentimentQueries.reduce((sum, q) => sum + q.brand_sentiment, 0) / sentimentQueries.length
        : 0
      
      this.sentimentData = {
        distribution,
        averageSentiment,
        totalQueries: sentimentQueries.length
      }
    },

    // Load competitor metrics for selected competitor
    async loadCompetitorMetrics(competitorId) {
      this.loading.competitors = true
      
      try {
        const response = await $fetch(`/api/dashboard/competitor-metrics/${competitorId}`)
        this.competitorMetrics = response
      } catch (error) {
        console.error('Failed to load competitor metrics:', error)
        this.errors.competitors = error.message
      } finally {
        this.loading.competitors = false
      }
    },

    // Load outcome analysis data
    async loadOutcomeData(filters) {
      const filteredQueries = this.filteredQueries(filters)
      
      // Group by response outcome
      const outcomeGroups = {}
      filteredQueries.forEach(query => {
        const outcome = query.response_outcome || 'Unknown'
        if (!outcomeGroups[outcome]) {
          outcomeGroups[outcome] = { total: 0, brandMentioned: 0, competitorMentioned: 0 }
        }
        outcomeGroups[outcome].total++
        if (query.brand_mentioned) {
          outcomeGroups[outcome].brandMentioned++
        }
        if (query.competitor_mentioned_names?.length) {
          outcomeGroups[outcome].competitorMentioned++
        }
      })
      
      this.outcomeData.outcomes = Object.entries(outcomeGroups)
        .map(([outcome, data]) => ({
          outcome,
          label: getOutcomeLabel(outcome),
          total: data.total,
          brandMentioned: data.brandMentioned,
          competitorMentioned: data.competitorMentioned,
          brandRate: data.total > 0 ? (data.brandMentioned / data.total) * 100 : 0,
          competitorRate: data.total > 0 ? (data.competitorMentioned / data.total) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total)
    },

    // Helper action methods
    calculateTypeBreakdown(queries) {
      const groups = {}
      queries.forEach(query => {
        const type = query.query_type || 'Unknown'
        if (!groups[type]) {
          groups[type] = { total: 0, mentioned: 0 }
        }
        groups[type].total++
        if (query.brand_mentioned) {
          groups[type].mentioned++
        }
      })
      
      return Object.entries(groups)
        .map(([type, data]) => ({
          type,
          label: getTypeLabel(type),
          total: data.total,
          mentioned: data.mentioned,
          mentionRate: data.total > 0 ? (data.mentioned / data.total) * 100 : 0
        }))
        .sort((a, b) => b.mentionRate - a.mentionRate)
    },

    calculateFunnelBreakdown(queries) {
      const groups = {}
      queries.forEach(query => {
        const stage = query.funnel_stage || 'Unknown'
        if (!groups[stage]) {
          groups[stage] = { total: 0, mentioned: 0 }
        }
        groups[stage].total++
        if (query.brand_mentioned) {
          groups[stage].mentioned++
        }
      })
      
      return Object.entries(groups)
        .map(([stage, data]) => ({
          stage,
          label: getFunnelLabel(stage),
          total: data.total,
          mentioned: data.mentioned,
          mentionRate: data.total > 0 ? (data.mentioned / data.total) * 100 : 0
        }))
        .sort((a, b) => b.mentionRate - a.mentionRate)
    },

    calculatePlatformBreakdown(queries) {
      const groups = {}
      queries.forEach(query => {
        const platform = query.data_source || 'Unknown'
        if (!groups[platform]) {
          groups[platform] = { total: 0, mentioned: 0 }
        }
        groups[platform].total++
        if (query.brand_mentioned) {
          groups[platform].mentioned++
        }
      })
      
      return Object.entries(groups)
        .map(([platform, data]) => ({
          platform,
          label: getPlatformLabel(platform),
          total: data.total,
          mentioned: data.mentioned,
          mentionRate: data.total > 0 ? (data.mentioned / data.total) * 100 : 0
        }))
        .sort((a, b) => b.mentionRate - a.mentionRate)
    },

    // Set selected query for detailed view
    setSelectedQuery(query) {
      this.selectedQuery = query
    },

    // Reset store state
    resetStore() {
      this.$reset()
    }
  }
})

// Helper functions
function getDaysFromRange(range) {
  const ranges = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '6m': 180,
    '1y': 365
  }
  return ranges[range] || 30
}

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

function getIntentLabel(intent) {
  const labels = {
    informational: 'Informational',
    commercial: 'Commercial',
    navigational: 'Navigational',
    transactional: 'Transactional'
  }
  return labels[intent?.toLowerCase()] || intent || 'Unknown'
}

function getTypeLabel(type) {
  const labels = {
    question: 'Question',
    command: 'Command', 
    comparison: 'Comparison',
    howto: 'How-to',
    definition: 'Definition'
  }
  return labels[type?.toLowerCase()] || type || 'Unknown'
}

function getFunnelLabel(stage) {
  const labels = {
    awareness: 'Awareness',
    consideration: 'Consideration',
    decision: 'Decision',
    retention: 'Retention'
  }
  return labels[stage?.toLowerCase()] || stage || 'Unknown'
}

function getOutcomeLabel(outcome) {
  const labels = {
    recommendation: 'Recommendation',
    comparison: 'Comparison',
    explanation: 'Explanation',
    tutorial: 'Tutorial',
    analysis: 'Analysis'
  }
  return labels[outcome?.toLowerCase()] || outcome || 'Unknown'
}